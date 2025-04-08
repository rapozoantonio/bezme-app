// app/(auth)/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';

const ACCESS_GRANTED_KEY = 'gateway_access_granted';

export default function AuthLayout() {
  const [gatewayAccess, setGatewayAccess] = useState<boolean | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check gateway access using localStorage
    const checkGatewayAccess = () => {
      try {
        const hasAccess = localStorage.getItem(ACCESS_GRANTED_KEY);
        setGatewayAccess(hasAccess === 'true');
      } catch (err) {
        console.error('Access check error:', err);
        setGatewayAccess(false);
      }
    };

    checkGatewayAccess();
  }, []);

  // While the access check is in progress, show nothing or a loading indicator
  if (gatewayAccess === null) {
    return null;
  }

  // If gateway access is not granted, redirect to the gateway index screen
  if (!gatewayAccess) {
    return <Redirect href="/(gateway)" />;
  }

  // Render the Auth stack if gateway access is valid
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000'
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign In', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Sign Up', headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password', headerShown: false }} />
    </Stack>
  );
}
