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
import { Link, useRouter } from "expo-router";
import useAuth from "../../hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";
import { getThemeStyles, layout, typography, forms, feedback } from "../../styles";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, loginWithGoogle, isLoading, error, user } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as "light" | "dark");

  // When the user is updated (after a successful register), redirect to the apps page.
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
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

    await register(email, password, name);
    // No need to call router.replace here since we listen to the updated auth context.
  };

  const handleGoogleSignUp = async () => {
    await loginWithGoogle();
  };

  return (
    <KeyboardAvoidingView
      style={[layout.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Create Account</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            Sign up to get started
          </Text>
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
              </Link>{" "}
              and{" "}
              <Link href="/(legal)/guidelines" asChild>
                <Text style={typography.link}>Community Guidelines</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
