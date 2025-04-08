// app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
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
import { router } from 'expo-router';
import useAuth from '../../hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  getThemeStyles, 
  layout, 
  typography, 
  forms, 
  feedback
} from '@/styles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { forgotPassword, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  
  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const success = await forgotPassword(email);
    if (success) {
      setResetSent(true);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  if (resetSent) {
    return (
      <View style={[layout.container, layout.center, { backgroundColor: theme.colors.background }]}>
        <View style={[layout.column, { padding: 20 }]}>
          <Text style={[typography.title, theme.textStyle]}>Check Your Email</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            We've sent password reset instructions to {email}
          </Text>
          <TouchableOpacity 
            style={[forms.button, theme.primaryButtonStyle, { marginTop: 20 }]} 
            onPress={handleBackToLogin}
          >
            <Text style={forms.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[layout.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView contentContainerStyle={[layout.scrollContent, layout.center]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Reset Password</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            Enter your email and we'll send you a reset link
          </Text>
        </View>
        
        {error && (
          <View style={[feedback.errorContainer, theme.errorContainerStyle]}>
            <Text style={[feedback.errorText, theme.errorTextStyle]}>{error}</Text>
          </View>
        )}

        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Email</Text>
            <TextInput
              style={[forms.input, theme.inputStyle]}
              placeholder="Enter your email address"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[forms.button, theme.primaryButtonStyle]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={forms.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ alignItems: 'center', padding: 15, marginTop: 10 }} 
            onPress={handleBackToLogin}
          >
            <Text style={typography.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}