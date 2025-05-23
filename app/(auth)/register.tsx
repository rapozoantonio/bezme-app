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
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import useAuth from "../../hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";
import { getThemeStyles, typography, forms, feedback } from "@/styles";
import { saveOnboardingData } from "../../firebase";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, loginWithGoogle, isLoading, error, user } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // State for all onboarding data
  const [personalityComplete, setPersonalityComplete] = useState(false);
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, number>>({});
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [dataSaved, setDataSaved] = useState(false);

  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as "light" | "dark");

  // Load personality and onboarding data only once when component mounts
  useEffect(() => {
    // Function to check and load all data
    const loadAllData = () => {
      // Check if personality assessment is complete
      const isComplete = params.personalityComplete === "true";
      setPersonalityComplete(isComplete);

      if (isComplete) {
        try {
          // Get both personality answers and full onboarding data
          const storedAnswers = sessionStorage.getItem("personalityAnswers");
          const storedOnboardingData = sessionStorage.getItem("onboardingData");

          if (storedAnswers) {
            setPersonalityAnswers(JSON.parse(storedAnswers));
          }

          if (storedOnboardingData) {
            setOnboardingData(JSON.parse(storedOnboardingData));

            // Prefill the name and email fields if available
            const parsedData = JSON.parse(storedOnboardingData);
            if (parsedData.fullName) {
              setName(parsedData.fullName);
            }
            if (parsedData.email) {
              setEmail(parsedData.email);
            }
          }

          // Redirect if essential data is missing
          if (!storedAnswers) {
            console.error("Missing personality answers");
            router.replace("/(auth)/welcome");
          }
        } catch (error) {
          console.error("Failed to retrieve onboarding data:", error);
          router.replace("/(auth)/welcome");
        }
      } else {
        // Redirect back to welcome screen if not complete
        router.replace("/(auth)/welcome");
      }
    };

    loadAllData();
    // We only want to run this once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save all onboarding data when user is available and data hasn't been saved yet
  useEffect(() => {
    const updateUserData = async () => {
      // Only proceed if:
      // 1. User is authenticated
      // 2. We have personality answers at minimum
      // 3. We haven't saved the data already
      if (user && Object.keys(personalityAnswers).length > 0 && !dataSaved) {
        try {
          // Save all onboarding data using our service function
          await saveOnboardingData(user.uid, personalityAnswers, onboardingData);
          
          // Mark as saved to prevent further save attempts
          setDataSaved(true);

          // Clear the stored data
          try {
            sessionStorage.removeItem("personalityAnswers");
            sessionStorage.removeItem("onboardingData");
          } catch (err) {
            console.error("Failed to clear data from storage:", err);
          }
        } catch (error) {
          console.error("Failed to save onboarding data:", error);
        }
      }
    };

    updateUserData();
  }, [user, personalityAnswers, onboardingData, dataSaved]);

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
      // The useEffect will handle saving all the data after auth
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Sign in with Google using our existing auth service
      await loginWithGoogle();
      // The useEffect will handle saving all the data after auth
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  // Handle back navigation
  const handleBackToQuestion = () => {
    router.push("/(auth)/onboarding");
  };

  // Get device dimensions
  const { height: windowHeight } = Dimensions.get("window");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Compact Header */}
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity onPress={handleBackToQuestion} style={{ alignSelf: "flex-start", marginBottom: 10 }}>
              <FontAwesome name="chevron-left" size={18} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={{ ...typography.title, ...theme.textStyle, fontSize: 22, marginBottom: 6 }}>Create Account</Text>
            <Text style={{ ...typography.subtitle, ...theme.textSecondaryStyle, fontSize: 14, marginBottom: 6 }}>
              Last Step! If this is skipped, we can't find your matches
            </Text>
          </View>

          {error && (
            <View style={{ ...feedback.errorContainer, ...theme.errorContainerStyle, marginBottom: 8 }}>
              <Text style={{ ...feedback.errorText, ...theme.errorTextStyle }}>{error}</Text>
            </View>
          )}

          <View style={{ flex: 1, justifyContent: "space-between" }}>
            {/* Form Fields in a more compact layout */}
            <View>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...typography.label, ...theme.textStyle, marginBottom: 4, fontSize: 13 }}>Full Name</Text>
                <TextInput
                  style={{ ...forms.input, ...theme.inputStyle, height: 42 }}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...typography.label, ...theme.textStyle, marginBottom: 4, fontSize: 13 }}>Email</Text>
                <TextInput
                  style={{ ...forms.input, ...theme.inputStyle, height: 42 }}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...typography.label, ...theme.textStyle, marginBottom: 4, fontSize: 13 }}>Password</Text>
                <TextInput
                  style={{ ...forms.input, ...theme.inputStyle, height: 42 }}
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ ...typography.label, ...theme.textStyle, marginBottom: 4, fontSize: 13 }}>
                  Confirm Password
                </Text>
                <TextInput
                  style={{ ...forms.input, ...theme.inputStyle, height: 42 }}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Buttons and footer section */}
            <View>
              <TouchableOpacity
                style={{ ...forms.button, ...theme.primaryButtonStyle, height: 46 }}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={forms.buttonText}>Create Account</Text>}
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 12 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
                <Text style={{ ...forms.dividerText, ...theme.textSecondaryStyle, marginHorizontal: 8 }}>OR</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
              </View>

              <TouchableOpacity
                style={{ ...forms.socialButton, ...theme.secondaryButtonStyle, height: 46 }}
                onPress={handleGoogleSignUp}
                disabled={isLoading}
              >
                <FontAwesome name="google" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={forms.buttonText}>Sign up with Google</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12 }}>
                <Text style={{ ...typography.body, ...theme.textSecondaryStyle, fontSize: 13 }}>
                  Already have an account?
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={{ ...typography.link, fontSize: 13 }}> Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Legal Terms Block - More compact */}
              <View style={{ marginTop: 8, alignItems: "center" }}>
                <Text style={{ ...typography.caption, ...theme.textSecondaryStyle, fontSize: 11, textAlign: "center" }}>
                  By signing up, you agree to our{" "}
                  <Link href="/(legal)/terms" asChild>
                    <Text style={{ ...typography.link, fontSize: 11 }}>Terms of Service</Text>
                  </Link>{" "}
                  and{" "}
                  <Link href="/(legal)/privacy" asChild>
                    <Text style={{ ...typography.link, fontSize: 11 }}>Privacy Policy</Text>
                  </Link>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
