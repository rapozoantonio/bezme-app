// app/(legal)/guidelines.tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles, layout, typography } from '@/styles';
import Markdown from 'react-native-markdown-display';
import { communityGuidelinesContent }  from '@/constants/CommunityGuidelines';

export default function CommunityGuidelinesScreen() {
  const colorScheme = useColorScheme();
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');
  
  const markdownStyles = {
    body: {
      color: theme.colors.text,
      fontSize: 16,
    },
    heading1: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    heading2: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 8,
    },
    paragraph: {
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 10,
      lineHeight: 22,
    },
    list_item: {
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 5,
    },
    bullet_list: {
      marginBottom: 10,
    },
  };

  return (
    <View style={[layout.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Markdown style={markdownStyles}>
          {communityGuidelinesContent}
        </Markdown>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});