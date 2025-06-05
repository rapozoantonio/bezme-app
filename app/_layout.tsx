// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { View, ActivityIndicator, Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../hooks/useAuth';

// Import GTM service to initialize it at app startup
import '../services/gtm';

// Use a safer approach for web-only code
if (Platform.OS === 'web') {
  // Use global or window to check if we're truly in a browser environment
  if (typeof window !== 'undefined' && window.document) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(style);
  }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


const ACCESS_GRANTED_KEY = 'gateway_access_granted';

// Simple loading screen component
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// This component checks for gateway access and forces a redirect if needed.
function GatewayAwareNavigator() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Gateway access check state. `null` means we haven't completed checking yet.
  const [gatewayAccess, setGatewayAccess] = useState<boolean | null>(null);

  // Check localStorage for the gateway access flag when the component mounts.
  useEffect(() => {
    const checkGatewayAccess = () => {
      try {
        const hasAccess = localStorage.getItem(ACCESS_GRANTED_KEY);
        setGatewayAccess(hasAccess === 'true');
      } catch (err) {
        console.error('Gateway access check error:', err);
        setGatewayAccess(false);
      }
    };
    checkGatewayAccess();
  }, []);

  // Once we know the gateway access, perform an imperative navigation if not granted.
  useEffect(() => {
    if (gatewayAccess !== null && gatewayAccess !== true) {
      router.replace('/(gateway)');
    } else if (gatewayAccess === true && !authLoading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [gatewayAccess, authLoading, user, router]);

  // While checking gateway access or auth status, show a loading indicator.
  if (gatewayAccess === null || authLoading) {
    return <LoadingScreen />;
  }
  
  // When gateway access is granted but the user is not logged in, redirect to the welcome screen.
  if (gatewayAccess && !user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  
  // If gateway access not granted, redirect to gateway
  if (!gatewayAccess) {
    return <Redirect href="/(gateway)" />;
  }
  
  // Otherwise, gateway access is granted and user is logged in. Render main content.
  return <Stack.Screen name="(tabs)" options={{ headerShown: false }} />;
}

// Root layout component that uses fonts, theming, and sets up the navigation stack.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Gateway route */}
          <Stack.Screen name="(gateway)" options={{ headerShown: false }} />
          {/* Authentication routes */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/* Dynamic navigator that checks gateway and auth state */}
          <GatewayAwareNavigator />
          {/* Fallback for not-found */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}