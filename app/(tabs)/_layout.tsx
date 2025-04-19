// app/(tabs)/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

const ACCESS_GRANTED_KEY = 'gateway_access_granted';

// Loading screen when checking auth
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [gatewayAccess, setGatewayAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  
  // Check gateway access first
  useEffect(() => {
    const checkGatewayAccess = () => {
      try {
        const hasAccess = localStorage.getItem(ACCESS_GRANTED_KEY);
        setGatewayAccess(hasAccess === 'true');
      } catch (err) {
        console.error('Access check error:', err);
        setGatewayAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkGatewayAccess();
  }, []);
  
  // In the tabs layout useEffect
  useEffect(() => {
    console.log("TABS: Auth check - User:", !!user, "GatewayAccess:", gatewayAccess, "IsLoading:", isLoading, "Checking:", checking);
    
    if (!checking && !isLoading) {
      if (!gatewayAccess) {
        console.log("TABS: Redirecting to gateway - gateway access check failed");
        router.replace('/(gateway)');
      }
      else if (!user) {
        console.log("TABS: Redirecting to welcome - user check failed");
        router.replace('/(auth)/welcome');
      } else {
        console.log("TABS: All checks passed, showing tabs");
      }
    }
  }, [user, isLoading, gatewayAccess, checking, router]);

  // Show loading indicator while checking
  if (isLoading || checking) {
    return <LoadingScreen />;
  }

  // If gateway access not granted, redirect to gateway
  if (!gatewayAccess) {
    return <Redirect href="/(gateway)" />;
  }

  // If no user, redirect to welcome screen
  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // User is authenticated and gateway access granted, show tabs
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarItemStyle: { flex: 1 },
        }}
      />
      {/* Other tabs will be added later */}
    </Tabs>
  );
}

// Import icon library
import { FontAwesome } from '@expo/vector-icons';

// TabBarIcon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}