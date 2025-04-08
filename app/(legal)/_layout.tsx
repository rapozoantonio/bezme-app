// app/(legal)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles } from '@/styles';

export default function LegalLayout() {
  const colorScheme = useColorScheme();
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="terms" 
        options={{ 
          title: "Terms of Service",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="privacy" 
        options={{ 
          title: "Privacy Policy",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="guidelines" 
        options={{ 
          title: "Community Guidelines",
          headerBackTitle: "Back"
        }} 
      />
    </Stack>
  );
}