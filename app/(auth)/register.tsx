// app/(auth)/register.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import useAuth from "../../hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";
import { getThemeStyles, layout, typography, forms, feedback } from "@/styles";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { calculatePersonality } from "@/utils/personalityCalculator";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, loginWithGoogle, isLoading, error, user } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get personality answers from sessionStorage
  const [personalityComplete, setPersonalityComplete] = useState(false);
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, number>>({});
  const [personalityDataSaved, setPersonalityDataSaved] = useState(false);

  // Load personality data only once when component mounts
  useEffect(() => {
    // Function to check and load personality data
    const loadPersonalityData = () => {
      // Check if personality assessment is complete
      const isComplete = params.personalityComplete === 'true';
      setPersonalityComplete(isComplete);
      
      if (isComplete) {
        try {
          // Try to get from sessionStorage
          const storedAnswers = sessionStorage.getItem('personalityAnswers');
          if (storedAnswers) {
            setPersonalityAnswers(JSON.parse(storedAnswers));
          } else {
            // If no answers in storage, redirect back to welcome screen
            router.replace('/(auth)/welcome');
          }
        } catch (error) {
          console.error('Failed to retrieve personality answers:', error);
          router.replace('/(auth)/welcome');
        }
      } else {
        // Redirect back to welcome screen if not complete
        router.replace('/(auth)/welcome');
      }
    };

    loadPersonalityData();
    // We only want to run this once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as "light" | "dark");

  // Save personality data when user is available and data hasn't been saved yet
  useEffect(() => {
    const updateUserData = async () => {
      // Only proceed if:
      // 1. User is authenticated
      // 2. We have personality answers
      // 3. We haven't saved the data already
      if (user && 
          Object.keys(personalityAnswers).length > 0 && 
          !personalityDataSaved) {
        try {
          // Calculate personality type based on answers
          const personalityResult = calculatePersonality(personalityAnswers);
          
          // Update the user document to include personality data
          await setDoc(doc(db, 'users', user.uid), {
            personalityAnswers,
            personalityResult,
            personalityComplete: true,
            updatedAt: serverTimestamp()
          }, { merge: true });
          
          console.log('Personality data saved to Firestore');
          
          // Mark as saved to prevent further save attempts
          setPersonalityDataSaved(true);
          
          // Clear the stored data
          try {
            sessionStorage.removeItem('personalityAnswers');
          } catch (err) {
            console.error('Failed to clear personality data from storage:', err);
          }
        } catch (firestoreErr) {
          console.error('Failed to save personality data to Firestore:', firestoreErr);
        }
      }
    };
    
    updateUserData();
  }, [user, personalityAnswers, personalityDataSaved]);

  // When the user is updated (after a successful register), redirect to the apps page
  useEffect(() => {
    if (user) {
      // Add a small delay to ensure Firestore operations complete
      const redirectTimer = setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, router]);

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      // Register the user with our existing auth service
      await register(email, password, name);
      // The useEffect will handle saving the personality data after auth
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Sign in with Google using our existing auth service
      await loginWithGoogle();
      // The useEffect will handle saving the personality data after auth
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  // Handle back navigation
  const handleBackToQuestion = () => {
    router.push('/(auth)/onboarding');
  };

  return (
    <KeyboardAvoidingView
      style={[layout.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <View style={layout.headerContainer}>
          <TouchableOpacity onPress={handleBackToQuestion} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
            <FontAwesome name="chevron-left" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={[typography.title, theme.textStyle]}>Create Account</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            Sign up to get started
          </Text>
          
          {personalityComplete && (
            <View style={{ 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: theme.colors.cardBackground, 
              borderRadius: 8 
            }}>
              <Text style={[typography.body, theme.textStyle]}>
                Thanks for completing the Mix-Making assessment!
              </Text>
            </View>
          )}
        </View>

        {error && (
          <View style={[feedback.errorContainer, theme.errorContainerStyle]}>
            <Text style={[feedback.errorText, theme.errorTextStyle]}>
              {error}
            </Text>
          </View>
        )}

        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Full Name</Text>
            <TextInput
              style={[forms.input, theme.inputStyle]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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
              placeholder="Create a password"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>
              Confirm Password
            </Text>
            <TextInput
              style={[forms.input, theme.inputStyle]}
              placeholder="Confirm your password"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[forms.button, theme.primaryButtonStyle]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={forms.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={forms.dividerContainer}>
            <View style={[forms.divider, theme.dividerStyle]} />
            <Text style={[forms.dividerText, theme.textSecondaryStyle]}>OR</Text>
            <View style={[forms.divider, theme.dividerStyle]} />
          </View>

          <TouchableOpacity
            style={[forms.socialButton, theme.secondaryButtonStyle]}
            onPress={handleGoogleSignUp}
            disabled={isLoading}
          >
            <FontAwesome
              name="google"
              size={20}
              color="white"
              style={forms.socialIcon}
            />
            <Text style={forms.buttonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={layout.linkContainer}>
            <Text style={[typography.body, theme.textSecondaryStyle]}>
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={typography.link}> Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Legal Terms Block */}
          <View style={layout.termsContainer}>
            <Text style={[typography.caption, theme.textSecondaryStyle]}>
              By signing up, you agree to our{" "}
              <Link href="/(legal)/terms" asChild>
                <Text style={typography.link}>Terms of Service</Text>
              </Link>{" "}
              and{" "}
              <Link href="/(legal)/privacy" asChild>
                <Text style={typography.link}>Privacy Policy</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}