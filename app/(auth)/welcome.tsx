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
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles, layout, typography } from '@/styles';

const ACCESS_GRANTED_KEY = 'gateway_access_granted';

export default function WelcomeScreen() {
  const router = useRouter();
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
        console.error('Access check error:', err);
        setGatewayAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkGatewayAccess();
  }, []);

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={[layout.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          {/* Replace with your app logo */}
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>Logo</Text>
          </View>
          <Text style={[typography.title, theme.textStyle, styles.appName]}>Your App Name</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle, styles.tagline]}>
            Your app's tagline goes here
          </Text>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, theme.primaryButtonStyle]}
              onPress={handleGetStarted}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, theme.secondaryButtonStyle, styles.signInButton]}
              onPress={handleSignIn}
            >
              <Text style={styles.buttonText}>I Already Have an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy Policy */}
          <View style={styles.termsContainer}>
            <Text style={[typography.caption, theme.textSecondaryStyle, styles.termsText]}>
              By signing up, you agree to our{" "}
              <Link href="/(legal)/terms" asChild>
                <Text style={styles.linkText}>Terms of Service</Text>
              </Link>{" "}
              and{" "}
              <Link href="/(legal)/privacy" asChild>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 24,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  signInButton: {
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
  },
  linkText: {
    color: '#3498db',
    fontWeight: '500',
  }
});