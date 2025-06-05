// app/(auth)/login.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import useAuth from '../../hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { 
  getThemeStyles, 
  layout, 
  typography, 
  forms, 
  feedback
} from '@/styles';
import * as GTM from "@/services/gtm";
// import DebugReset from '@/components/debugComponents/DebugReset';
// import TestFirebaseAnalytics from '@/components/debugComponents/TestFirebaseAnalytics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading, error, user } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');

  // Monitor authentication state and redirect when user is logged in
  useEffect(() => {
    if (user) { 
      try {
        localStorage.setItem('gateway_access_granted', 'true');
        
        // Check if it was set properly
        const checkFlag = localStorage.getItem('gateway_access_granted');
      } catch (err) {
        console.error('LOGIN: Failed to set gateway access:', err);
      }
      
      // Add a small delay to ensure state updates before navigation
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
    }
  }, [user, router]);
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      console.log('Attempting login with email and password');
      // Track with Google Tag Manager - login attempt
      GTM.pushToDataLayer(GTM.GTMEvents.CREATE_ACCOUNT);
      await login(email, password);
      // The useEffect above will handle navigation when user state changes
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      console.log('Attempting login with Google');
      // Track with Google Tag Manager - Google login attempt
      GTM.trackGoogleSignIn();
      await loginWithGoogle();
      // The useEffect above will handle navigation when user state changes
    } catch (err: any) {
      console.error('Google login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[layout.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Sign In</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            Welcome back! Please sign in to continue
          </Text>
        </View>
        
        {error && (
          <View style={[feedback.errorContainer, theme.errorContainerStyle]}>
            <Text style={[feedback.errorText, theme.errorTextStyle]}>{error}</Text>
          </View>
        )}
        {/* <DebugReset /> */}
        {/* <TestFirebaseAnalytics /> */}
        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Email</Text>
            <TextInput
              style={[forms.input, theme.inputStyle]}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Password</Text>
            <TextInput
              style={[forms.input, theme.inputStyle]}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
              <Text style={typography.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[forms.button, theme.primaryButtonStyle]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={forms.buttonText}>Sign In with Email</Text>
            )}
          </TouchableOpacity>

          <View style={forms.dividerContainer}>
            <View style={[forms.divider, theme.dividerStyle]} />
            <Text style={[forms.dividerText, theme.textSecondaryStyle]}>OR</Text>
            <View style={[forms.divider, theme.dividerStyle]} />
          </View>

          <TouchableOpacity 
            style={[forms.socialButton, theme.secondaryButtonStyle]} 
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <FontAwesome name="google" size={20} color="white" style={forms.socialIcon} />
            <Text style={forms.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={[typography.body, theme.textSecondaryStyle]}>
              Don't have an account?
            </Text>
            <Link href="/(auth)/welcome" asChild>
              <TouchableOpacity>
                <Text style={typography.link}> Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}