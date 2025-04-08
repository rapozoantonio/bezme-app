// app/(tabs)/_layout.tsx
import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

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
  
  // Authentication guard for tabs
  useEffect(() => {
    if (!isLoading && !user) {
      // If no user is logged in, redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, router]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If no user and not loading, redirect to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // User is authenticated, show tabs
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      {/* Add more tabs as needed */}
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