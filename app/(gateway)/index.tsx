// app/(gateway)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  getThemeStyles, 
  layout, 
  typography, 
  forms, 
  feedback
} from '@/styles';
import { FontAwesome } from '@expo/vector-icons';

// The correct access password (consider using environment variables in production)
const CORRECT_PASSWORD = 'powerfulconnections';
// Storage key for remembering access
const ACCESS_GRANTED_KEY = 'gateway_access_granted';
// Maximum number of password attempts
const MAX_ATTEMPTS = 3;

export default function PasswordGateScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const colorScheme = useColorScheme();
  
  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');

  // Check if user already has access using localStorage
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Use localStorage for simplicity
        const hasAccess = localStorage.getItem(ACCESS_GRANTED_KEY);
        if (hasAccess === 'true') {
          console.log('User already has access, redirecting from gateway...');
          router.replace('/(auth)/welcome');
        } else {
          setCheckingAccess(false);
        }
      } catch (err) {
        console.error('Access check error:', err);
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, []);

  const handleSubmit = async () => {
    if (attempts >= MAX_ATTEMPTS) {
      Alert.alert(
        'Too Many Attempts', 
        'You have exceeded the maximum number of password attempts. Please contact support.'
      );
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (password.trim().toLowerCase() === CORRECT_PASSWORD) {
        console.log('password is correct');
        setAttempts(0);
        // Save the access flag in localStorage
        localStorage.setItem(ACCESS_GRANTED_KEY, 'true');
        console.log('access saved to localStorage');
        router.replace('/(auth)/welcome');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Maximum attempts reached. Please contact support.');
        } else {
          setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInstagram = () => {
    Linking.openURL('https://www.instagram.com/bezmezh.hub/');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.bezmezhhub.com/');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  if (checkingAccess) {
    return (
      <View style={[layout.container, layout.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[layout.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView 
        contentContainerStyle={[layout.scrollContent, layout.center]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Enter Password</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            Join the Bezme Community
          </Text>
        </View>
        
        {error ? (
          <View style={[feedback.errorContainer, theme.errorContainerStyle]}>
            <Text style={[feedback.errorText, theme.errorTextStyle]}>{error}</Text>
          </View>
        ) : null}

        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <TextInput
              style={[forms.input, theme.inputStyle]}
              placeholder="Enter the password"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity 
              style={{ position: 'absolute', right: 10, top: 15 }}
              onPress={togglePasswordVisibility}
            >
              <FontAwesome 
                name={isPasswordVisible ? "eye-slash" : "eye"} 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              forms.button, 
              theme.primaryButtonStyle,
              (isLoading || attempts >= MAX_ATTEMPTS) && { opacity: 0.5 }
            ]}
            onPress={handleSubmit}
            disabled={isLoading || attempts >= MAX_ATTEMPTS}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={forms.buttonText}>Unlock Access</Text>
            )}
          </TouchableOpacity>

          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <Text style={[typography.body, theme.textSecondaryStyle]}>
              Don't have access? Connect with us on
            </Text>
            <View style={[layout.row, { marginTop: 8 }]}>
              <TouchableOpacity onPress={handleOpenInstagram}>
                <Text style={typography.link}>Instagram @bezmezh.hub</Text>
              </TouchableOpacity>
            </View>
            <View style={[layout.row, { marginTop: 4 }]}>
              <Text style={[typography.body, theme.textSecondaryStyle]}>Visit </Text>
              <TouchableOpacity onPress={handleOpenWebsite}>
                <Text style={typography.link}>www.bezmezhhub.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <Text style={[typography.subtitle, { fontWeight: 'bold' }, theme.textStyle]}>
              Bezme Mix-Making
            </Text>
            <Text style={[typography.caption, theme.textSecondaryStyle, { marginTop: 8, textAlign: 'center' }]}>
              A community for young creators & founders who question the status quo. 
              We connect people across industries to spark innovation and expand horizons.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
