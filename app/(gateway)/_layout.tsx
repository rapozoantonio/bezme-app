// app/(gateway)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles } from '@/styles';

export default function GatewayLayout() {
  const colorScheme = useColorScheme();
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}