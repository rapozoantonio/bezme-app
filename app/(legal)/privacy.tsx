import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles, layout } from '@/styles';
import Markdown from 'react-native-markdown-display';
import { privacyPolicyContent } from '@/constants/PrivacyPolicy';

export default function PrivacyPolicyScreen() {
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
          {privacyPolicyContent}
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