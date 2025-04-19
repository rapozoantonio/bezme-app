// app/(auth)/welcome.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Link, useRouter, usePathname } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles, layout, typography, spacing } from '@/styles';

const ACCESS_GRANTED_KEY = 'gateway_access_granted';

export default function WelcomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const [gatewayAccess, setGatewayAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  
  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');

  // Check gateway access on mount
  useEffect(() => {
    const checkGatewayAccess = () => {
      try {
        const hasAccess = localStorage.getItem(ACCESS_GRANTED_KEY);
        setGatewayAccess(hasAccess === 'true');
      } catch (err) {
        console.error('WELCOME: Access check error:', err);
        setGatewayAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkGatewayAccess();
  }, [pathname]);

  // Redirect if gateway access not granted
  useEffect(() => {
    if (!checking && gatewayAccess === false) {
      router.replace('/(gateway)');
    }
  }, [checking, gatewayAccess, router]);

  // Show loading indicator while checking
  if (checking) {
    return (
      <SafeAreaView style={[layout.container, { backgroundColor: theme.colors.background }]}>
        <View style={layout.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // If gateway access not granted, don't render content (redirection happens in useEffect)
  if (!gatewayAccess) {
    return null;
  }

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding');
  };

  const handleSignIn = () => { 
    // The key change: Use replace instead of push and ensure the path is correct
    router.replace('/(auth)/login');
    
    // If the above doesn't work, uncomment this direct approach
    // setTimeout(() => {
    //   window.location.href = '/(auth)/login';
    // }, 100);
  };

  return (
    <SafeAreaView style={[layout.container, { backgroundColor: theme.colors.background }]}>
      <View style={[layout.container, { justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl }]}>
        <View style={{ alignItems: 'center', marginTop: spacing.xxl }}>
          {/* Replace with your app logo */}
          <View style={[logoStyles.logoPlaceholder, { backgroundColor: theme.colors.primary }]}>
            <Text style={[typography.body, { color: '#fff', fontWeight: 'bold' }]}>Logo</Text>
          </View>
          <Text style={[typography.title, theme.textStyle]}>Bezme</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            You are about to match with 2 amazing founders & creators
          </Text>
        </View>

        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: '100%', marginBottom: spacing.lg }}>
            <TouchableOpacity
              style={[logoStyles.button, theme.primaryButtonStyle]}
              onPress={handleGetStarted}
            >
              <Text style={[typography.button, { color: '#fff' }]}>Get Started</Text>
            </TouchableOpacity>
            
            {/* Direct login button with router.replace */}
            <TouchableOpacity
              style={[logoStyles.button, theme.secondaryButtonStyle, { marginTop: spacing.md }]}
              onPress={handleSignIn}
            >
              <Text style={[typography.button, { color: '#fff' }]}>I Already Have an Account</Text>
            </TouchableOpacity>
            
            {/* Alternative Link-based approach 
            <Link href="/(auth)/login" asChild replace>
              <TouchableOpacity
                style={[logoStyles.button, theme.secondaryButtonStyle, { marginTop: spacing.md }]}
              >
                <Text style={[typography.button, { color: '#fff' }]}>I Already Have an Account</Text>
              </TouchableOpacity>
            </Link>
            */}
          </View>

          {/* Debug button
          <TouchableOpacity 
            onPress={() => console.log("Current route:", pathname)}
            style={{ marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 5 }}
          >
            <Text>Debug: Show Current Route</Text>
          </TouchableOpacity>
          */}

          {/* Terms and Privacy Policy */}
          <View style={layout.termsContainer}>
            <Text style={[typography.caption, theme.textSecondaryStyle]}>
              By signing up, you agree to our{" "}
              <Link href="/(legal)/terms" asChild>
                <Text style={theme.linkStyle}>Terms of Service</Text>
              </Link>{" "}
              and{" "}
              <Link href="/(legal)/privacy" asChild>
                <Text style={theme.linkStyle}>Privacy Policy</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Keeping minimal styles that aren't available in the centralized system
const logoStyles = StyleSheet.create({
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  }
});