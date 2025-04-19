import { StyleSheet } from 'react-native';

// Theme colors - enhanced for better contrast and mobile readability
export const colors = {
  light: {
    primary: '#7575FF',         // Deeper purple for better contrast
    secondary: '#66C057',       // Deeper mint green for better contrast
    background: '#FEFDFA',      // Off-white background
    card: '#FFFFFF',            // Pure white cards for elevation
    text: '#000000',            // Black text for maximum readability
    textSecondary: '#00000099', // 60% opacity
    textPlaceholder: '#00000066', // 40% opacity
    border: '#E0E0E0',          // Subtler border
    error: '#D32F2F',
    errorBackground: '#FFEBEE',
    success: '#4CAF50',
    successBackground: '#E8F5E9',
    link: '#6060FF',            // Deeper link color for better accessibility
    buttonText: '#FFFFFF',      // White text on buttons for contrast
  },
  dark: {
    primary: '#8A8AFF',         // Brighter purple for dark mode
    secondary: '#7ED471',       // Brighter mint green for dark mode
    background: '#000000',      // Black background
    card: '#121212',            // Dark grey cards
    text: '#FEFDFA',            // Off-white text
    textSecondary: '#FEFDFA99', // 60% opacity
    textPlaceholder: '#FEFDFA66', // 40% opacity
    border: '#333333',
    error: '#EF5350',
    errorBackground: '#3E2723',
    success: '#81C784',
    successBackground: '#1B5E20',
    link: '#9090FF',            // Brighter link color for dark mode
    buttonText: '#FFFFFF',      // White text on buttons for contrast
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

// Typography definitions with SF Pro for iOS and Roboto for Android
// These system fonts render much more clearly on mobile devices
export const typography = StyleSheet.create({
  title: {
    // Using system fonts that render crisply on mobile
    fontFamily: 'System',
    fontSize: 24, // Slightly smaller for better rendering
    fontWeight: '700', // Bold but not extra-bold for better rendering
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5, // Tighter letter spacing for modern feel
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600', // Semi-bold for better distinction
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400', // Regular weight
    lineHeight: 22, // Improved line height for readability
  },
  label: {
    fontFamily: 'System',
    fontSize: 15, // Slightly smaller for forms
    marginBottom: spacing.sm,
    fontWeight: '500', // Medium weight
  },
  button: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600', // Semi-bold for better tap targets
    letterSpacing: -0.2,
  },
  small: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500', // Medium weight
    color: colors.light.link,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 13, // Smaller size for captions
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
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

// Form styles - optimized for better mobile UX
export const forms = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    fontFamily: 'System',
    height: 50,
    borderWidth: 1,
    borderRadius: 12, // More rounded corners
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF', // Ensuring input has background
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // More rounded corners
    marginBottom: spacing.md,
    elevation: 2, // Adding subtle elevation for buttons
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontFamily: 'System',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2, // Tighter letter spacing
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
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Buttons in different variations - enhanced for better contrast and touch targets
  primaryButton: {
    backgroundColor: colors.light.primary,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.light.secondary,
    shadowColor: colors.light.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5, // Slightly thicker border
    borderColor: colors.light.primary,
  },
  outlineButtonText: {
    color: colors.light.primary,
    fontWeight: '600',
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
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  successContainer: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  successText: {
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-SemiBold',
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
      backgroundColor: colorScheme === 'light' ? '#FFFFFF' : theme.card,
      borderColor: theme.border,
      color: theme.text,
      borderRadius: 12,
    },
    
    // Text styles
    textStyle: {
      color: theme.text,
      fontFamily: 'System',
    },
    textSecondaryStyle: {
      color: theme.textSecondary,
      fontFamily: 'System',
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