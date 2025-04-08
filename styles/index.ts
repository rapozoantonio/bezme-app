// styles/index.ts
import { StyleSheet } from 'react-native';

// Theme colors
export const colors = {
  light: {
    primary: '#4285F4',
    secondary: '#DB4437',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    textSecondary: '#00000099', // 60% opacity
    textPlaceholder: '#00000066', // 40% opacity
    border: '#DDDDDD',
    error: '#D32F2F',
    errorBackground: '#FFEBEE',
    success: '#4CAF50',
    successBackground: '#E8F5E9',
    link: '#4285F4',
  },
  dark: {
    primary: '#4285F4',
    secondary: '#DB4437',
    background: '#121212',
    card: '#333333',
    text: '#FFFFFF',
    textSecondary: '#FFFFFF99', // 60% opacity
    textPlaceholder: '#FFFFFF66', // 40% opacity
    border: '#444444',
    error: '#EF5350',
    errorBackground: '#3E2723',
    success: '#81C784',
    successBackground: '#1B5E20',
    link: '#4285F4',
  }
};

// Spacing values for consistent layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography definitions
export const typography = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  small: {
    fontSize: 14,
  },
  link: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.link, // We'll use primary color for links in both themes
  },
  caption: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Common layout styles
export const layout = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  footerContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  // Link container styles
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  // Terms text container
  termsContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

// Form styles
export const forms = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButton: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  socialIcon: {
    marginRight: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
  // Additional form elements
  checkbox: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Buttons in different variations
  primaryButton: {
    backgroundColor: colors.light.primary,
  },
  secondaryButton: {
    backgroundColor: colors.light.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  outlineButtonText: {
    color: colors.light.primary,
  },
});

// Feedback styles (errors, alerts, etc.)
export const feedback = StyleSheet.create({
  errorContainer: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 14,
  },
  successContainer: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 14,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

// Cards and content containers
export const containers = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
});

// Helper function to get theme-based styles
export const getThemeStyles = (colorScheme: 'light' | 'dark') => {
  const theme = colors[colorScheme];
  
  return {
    // Basic colors
    colors: theme,
    
    // Input styles
    inputStyle: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.text,
    },
    
    // Text colors
    textStyle: {
      color: theme.text,
    },
    textSecondaryStyle: {
      color: theme.textSecondary,
    },
    
    // Button styles
    primaryButtonStyle: {
      backgroundColor: theme.primary,
    },
    secondaryButtonStyle: {
      backgroundColor: theme.secondary,
    },
    outlineButtonStyle: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.primary,
    },
    outlineButtonTextStyle: {
      color: theme.primary,
    },
    
    // Feedback styles
    errorContainerStyle: {
      backgroundColor: theme.errorBackground,
    },
    errorTextStyle: {
      color: theme.error,
    },
    successContainerStyle: {
      backgroundColor: theme.successBackground,
    },
    successTextStyle: {
      color: theme.success,
    },
    
    // Divider style
    dividerStyle: {
      backgroundColor: theme.border,
    },
    
    // Card style
    cardStyle: {
      backgroundColor: theme.card,
    },
    
    // Link style
    linkStyle: {
      color: theme.link,
    },
  };
};

// Export all styles together
export default {
  colors,
  spacing,
  typography,
  layout,
  forms,
  feedback,
  containers,
  getThemeStyles,
};