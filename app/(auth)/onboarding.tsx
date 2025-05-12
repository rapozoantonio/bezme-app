// app/(auth)/onboarding.tsx
import React, { useReducer, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getThemeStyles, layout, typography, forms, spacing } from "@/styles";
import { personalityQuestions } from "@/constants/PersonalityQuestions";
import { projectTypes, projectStatusOptions } from "@/constants/ProjectQuestionsOptions";
import { interestOptions } from "@/constants/InterestsQuestionsOptions";
import { locationOptions } from "@/constants/LocationOptions";
import { savePartialOnboardingData } from "../../firebase";
import MatchStatsComponent from "@/components/onboarding/MatchStatsComponent";
import PotentialMatchesComponent from "@/components/onboarding/PotentialMatchesComponent";

// Define onboarding steps
enum OnboardingStep {
  BASIC_INFO = 0,
  PROJECT_STATUS = 1,
  PROJECT_TYPE = 2,
  PERSONALITY_QUESTIONS = 3,
  MATCH_STATS = 4,
  INTERESTS_SELECTION = 5,
  MATCH_REVEAL = 6,
}

// Define action types for reducer
type OnboardingAction =
  | { type: "SET_FIELD"; field: string; value: any }
  | { type: "TOGGLE_PROJECT_TYPE"; typeId: string }
  | { type: "TOGGLE_INTEREST"; interestId: string }
  | { type: "SET_PERSONALITY_ANSWER"; questionId: string; rating: number }
  | { type: "RESET_ERRORS" }
  | { type: "SET_ERROR"; field: string; message: string };

// Define onboarding state type
interface OnboardingState {
  fullName: string;
  email: string;
  location: string | null;
  projectStatus: string | null;
  projectTypes: string[];
  personalityAnswers: Record<string, number>;
  selectedInterests: string[];
  errors: Record<string, string>;
}
// Initial state
const initialState: OnboardingState = {
  fullName: "",
  email: "",
  location: null,
  projectStatus: null,
  projectTypes: [],
  personalityAnswers: {},
  selectedInterests: [],
  errors: {},
};

// Onboarding reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "TOGGLE_PROJECT_TYPE": {
      const currentSelected = [...state.projectTypes];
      if (currentSelected.includes(action.typeId)) {
        // Deselect
        return {
          ...state,
          projectTypes: currentSelected.filter((id) => id !== action.typeId),
        };
      } else if (currentSelected.length < 3) {
        // Select if under 3 items
        return {
          ...state,
          projectTypes: [...currentSelected, action.typeId],
        };
      }
      return state;
    }

    case "SET_PERSONALITY_ANSWER":
      return {
        ...state,
        personalityAnswers: {
          ...state.personalityAnswers,
          [action.questionId]: action.rating,
        },
      };

    case "RESET_ERRORS":
      return { ...state, errors: {} };

    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };

    case "TOGGLE_INTEREST": {
      const currentSelected = [...state.selectedInterests];
      if (currentSelected.includes(action.interestId)) {
        // Deselect
        return {
          ...state,
          selectedInterests: currentSelected.filter((id) => id !== action.interestId),
        };
      } else if (currentSelected.length < 2) {
        // Select if under 2 items
        return {
          ...state,
          selectedInterests: [...currentSelected, action.interestId],
        };
      }
      return state;
    }

    default:
      return state;
  }
}

// Component for displaying an error message
const ErrorMessage = ({ message, theme }: { message?: string; theme: any }) => {
  if (!message) return null;
  return <Text style={[typography.small, theme.errorTextStyle]}>{message}</Text>;
};

// Component for a selection button
const SelectionButton = ({
  selected,
  onPress,
  label,
  theme,
  disabled = false,
  emoji = null,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  theme: any;
  disabled?: boolean;
  emoji?: string | null;
}) => {
  const isProjectType = emoji !== null;

  // Different styling for project type buttons
  if (isProjectType) {
    return (
      <TouchableOpacity
        style={[
          {
            borderRadius: 20,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            margin: spacing.xs,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
            backgroundColor: selected ? `${theme.colors.primary}20` : theme.colors.background,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={{ fontSize: 16, marginRight: spacing.xs }}>{emoji}</Text>
        <Text
          style={[
            typography.small,
            {
              color: selected ? theme.colors.primary : theme.colors.text,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  // Regular selection button
  return (
    <TouchableOpacity
      style={[
        forms.button,
        selected
          ? {
              backgroundColor: `${theme.colors.primary}20`,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            }
          : {
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
        { marginBottom: spacing.md },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          typography.body,
          {
            color: selected ? theme.colors.primary : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Component for a rating button
const RatingButton = ({
  rating,
  selectedRating,
  onPress,
  isLoading,
  theme,
}: {
  rating: number;
  selectedRating: number | null;
  onPress: () => void;
  isLoading: boolean;
  theme: any;
}) => {
  const isSelected = selectedRating === rating;

  return (
    <TouchableOpacity
      style={{
        width: 68,
        height: 68,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isSelected ? theme.colors.primary : theme.colors.background,
        borderWidth: 1.5,
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        ...(Platform.OS === "ios"
          ? {
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          : {
              elevation: 2,
            }),
      }}
      onPress={onPress}
      disabled={isLoading}
    >
      {isSelected && isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: isSelected ? "#fff" : theme.colors.text,
          }}
        >
          {rating}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Progress indicator component
const ProgressIndicator = ({
  currentStep,
  currentQuestionIndex,
  theme,
}: {
  currentStep: OnboardingStep;
  currentQuestionIndex: number;
  theme: any;
}) => {
  // Calculate overall progress
  const totalQuestions = personalityQuestions.length;
  const totalSteps = Object.keys(OnboardingStep).length / 2; // Total number of steps
  let progress = 0;

  if (currentStep === OnboardingStep.PERSONALITY_QUESTIONS) {
    // For personality questions, combine steps 0-2 (40%) and distribute personality across 40%
    const baseProgress = 40; // First 3 steps (0, 1, 2) = 40%
    const personalityProgress = (currentQuestionIndex / totalQuestions) * 40;
    progress = baseProgress + personalityProgress;
  } else if (currentStep > OnboardingStep.PERSONALITY_QUESTIONS) {
    // After personality questions, we're at 80% complete, and the final steps share the remaining 20%
    const baseProgress = 80; // After personality questions
    const remainingStepsWeight = 20; // Final steps share 20%
    const totalStepsAfterPersonality = totalSteps - OnboardingStep.PERSONALITY_QUESTIONS - 1; // Number of steps after personality
    const stepsCompletedAfterPersonality = currentStep - OnboardingStep.PERSONALITY_QUESTIONS;

    // Calculate progress based on completed steps after personality questions
    const additionalProgress = Math.min(
      (stepsCompletedAfterPersonality / totalStepsAfterPersonality) * remainingStepsWeight,
      remainingStepsWeight
    );
    progress = baseProgress + additionalProgress;
  } else {
    // For initial steps 0-2, each is worth about 13% (40% / 3)
    progress = (currentStep / 3) * 40;
  }

  // Ensure progress never exceeds 100%
  progress = Math.min(progress, 100);

  return (
    <View
      style={{
        position: "absolute",
        bottom: Platform.OS === "ios" ? 40 : 20,
        width: "100%",
        paddingHorizontal: spacing.md,
      }}
    >
      {/* Progress text */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: spacing.xs,
        }}
      >
        <Text style={[typography.caption, theme.textSecondaryStyle]}>
          {currentStep === OnboardingStep.PERSONALITY_QUESTIONS
            ? `Question ${currentQuestionIndex + 1} of ${totalQuestions}`
            : `Step ${currentStep + 1} of ${totalSteps}`}
        </Text>
        <Text style={[typography.caption, theme.textSecondaryStyle]}>{Math.round(progress)}%</Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 4,
          width: "100%",
          backgroundColor: theme.colors.border,
          borderRadius: 2,
        }}
      >
        <View
          style={{
            height: 4,
            width: `${progress}%`,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
};

// Main onboarding component
export default function OnboardingScreen() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.BASIC_INFO);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [randomizedQuestions, setRandomizedQuestions] = useState<typeof personalityQuestions>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getThemeStyles(colorScheme as "light" | "dark");

  const currentQuestion =
    randomizedQuestions.length > 0 ? randomizedQuestions[currentQuestionIndex] : personalityQuestions[currentQuestionIndex];

  // Effect to handle auto-navigation after rating selection
  React.useEffect(() => {
    if (selectedRating !== null && currentStep === OnboardingStep.PERSONALITY_QUESTIONS) {
      handleRatingSelected(selectedRating);
    }
  }, [selectedRating]);

  React.useEffect(() => {
    const shuffleQuestions = () => {
      // Create a copy of the questions
      const questionsCopy = [...personalityQuestions];

      // Fisher-Yates shuffle algorithm
      for (let i = questionsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
      }

      setRandomizedQuestions(questionsCopy);
    };

    shuffleQuestions();
  }, []);

  // Form validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateBasicInfo = (): boolean => {
    dispatch({ type: "RESET_ERRORS" });
    let isValid = true;

    if (!state.fullName.trim()) {
      dispatch({ type: "SET_ERROR", field: "fullName", message: "Full name is required" });
      isValid = false;
    }

    if (!state.email.trim()) {
      dispatch({ type: "SET_ERROR", field: "email", message: "Email is required" });
      isValid = false;
    } else if (!validateEmail(state.email)) {
      dispatch({ type: "SET_ERROR", field: "email", message: "Please enter a valid email" });
      isValid = false;
    }

    return isValid;
  };

  // Step navigation handlers
  const handleBasicInfoSubmit = () => {
    if (validateBasicInfo()) {
      // Prepare the basic user data for marketing
      const basicUserData = {
        fullName: state.fullName,
        email: state.email,
        location: state.location,
      };

      // Save to Firebase for marketing (non-blocking)
      savePartialOnboardingData(basicUserData).catch((err) => console.error("Failed to save partial onboarding data:", err));

      // Continue to next step
      setCurrentStep(OnboardingStep.PROJECT_STATUS);
    }
  };

  const handleProjectStatusSelect = (statusId: string) => {
    dispatch({ type: "SET_FIELD", field: "projectStatus", value: statusId });

    if (statusId === "no") {
      if (Platform.OS === "web") {
        window.alert(
          "You see we designed this experience for creators & founders – established and becoming. If you're not creating or building anything yet, we can't onboard you. We'll let you know if we plan any public event in your city. And as soon as you start build your thing, you know where to find us😉."
        );
        setTimeout(() => {
          router.replace("/(auth)/welcome");
        }, 300);
      } else {
        Alert.alert(
          "Hmm, we might not be a good fit",
          "You see we designed this experience for creators & founders – established and becoming. If you're not creating or building anything yet, we can't onboard you. We'll let you know if we plan any public event in your city. And as soon as you start build your thing, you know where to find us😉.",
          [
            {
              text: "I understand",
              onPress: () => router.replace("/(auth)/welcome"),
            },
          ]
        );
      }
    } else {
      setCurrentStep(OnboardingStep.PROJECT_TYPE);
    }
  };
  const handleProjectTypeSelect = (typeId: string) => {
    dispatch({ type: "TOGGLE_PROJECT_TYPE", typeId });
  };

  const handleProjectTypeSubmit = () => {
    // Skip directly to personality questions
    setCurrentStep(OnboardingStep.PERSONALITY_QUESTIONS);
  };
  // Project Description submit handler removed

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    setIsLoading(true);
  };

  const handleRatingSelected = (rating: number) => {
    // Store the answer
    dispatch({
      type: "SET_PERSONALITY_ANSWER",
      questionId: currentQuestion.id,
      rating,
    });

    // Short delay to show the selection before moving on
    const navigationTimer = setTimeout(() => {
      if (currentQuestionIndex < (randomizedQuestions.length || personalityQuestions.length) - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedRating(null);
        setIsLoading(false);
      } else {
        // All personality questions answered, move to match stats
        setCurrentStep(OnboardingStep.MATCH_STATS);
        setSelectedRating(null);
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(navigationTimer);
  };

  const handleMatchStatsContinue = () => {
    setCurrentStep(OnboardingStep.INTERESTS_SELECTION);
  };

  const handleInterestSelect = (interestId: string) => {
    dispatch({ type: "TOGGLE_INTEREST", interestId });
  };

  // Handler for sign up button
  const handleSignUp = () => {
    // Store data in sessionStorage with the correct keys
    try {
      // Create final onboarding data object without removed fields
      const finalOnboardingData = {
        ...state,
      };

      // Store complete onboarding data
      sessionStorage.setItem("onboardingData", JSON.stringify(finalOnboardingData));

      // Also store personalityAnswers specifically since register.tsx looks for this key
      sessionStorage.setItem("personalityAnswers", JSON.stringify(state.personalityAnswers));
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }

    // Navigate to the registration screen with the expected parameter
    router.push({
      pathname: "/(auth)/register",
      params: {
        personalityComplete: "true",
      },
    });
  };
  // Handle step navigation
  const handleBack = () => {
    switch (currentStep) {
      case OnboardingStep.PROJECT_TYPE:
        setCurrentStep(OnboardingStep.PROJECT_STATUS);
        break;
      case OnboardingStep.PROJECT_STATUS:
        setCurrentStep(OnboardingStep.BASIC_INFO);
        break;
      default:
        break;
    }
  };

  // Modified renderBasicInfoStep with simple location dropdown
  const renderBasicInfoStep = () => {
    const handleLocationSelect = (item: any) => {
      if (item.label === "Other") {
        setIsCustomLocation(true);
        setCustomLocation("");
        dispatch({ type: "SET_FIELD", field: "location", value: "" });
      } else {
        setIsCustomLocation(false);
        dispatch({ type: "SET_FIELD", field: "location", value: `${item.emoji} ${item.label}` });
      }
      setShowLocationOptions(false);
    };

    const handleCustomLocationChange = (text: any) => {
      setCustomLocation(text);
      dispatch({ type: "SET_FIELD", field: "location", value: text });
    };

    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>First, tell us a bit about yourself</Text>
        </View>

        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Full Name</Text>
            <TextInput
              style={[forms.input, theme.inputStyle, state.errors.fullName && { borderColor: theme.colors.error }]}
              value={state.fullName}
              onChangeText={(text) => dispatch({ type: "SET_FIELD", field: "fullName", value: text })}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textPlaceholder}
            />
            <ErrorMessage message={state.errors.fullName} theme={theme} />
          </View>

          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Email</Text>
            <TextInput
              style={[forms.input, theme.inputStyle, state.errors.email && { borderColor: theme.colors.error }]}
              value={state.email}
              onChangeText={(text) => dispatch({ type: "SET_FIELD", field: "email", value: text })}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ErrorMessage message={state.errors.email} theme={theme} />
          </View>

          {/* Location Field with Custom Option */}
          <View style={forms.inputContainer}>
            <Text style={[typography.label, theme.textStyle]}>Location</Text>

            {isCustomLocation ? (
              // Custom location input
              <TextInput
                style={[forms.input, theme.inputStyle, state.errors.location && { borderColor: theme.colors.error }]}
                value={customLocation}
                onChangeText={handleCustomLocationChange}
                placeholder="Enter your location"
                placeholderTextColor={theme.colors.textPlaceholder}
                autoFocus
              />
            ) : (
              // Location dropdown
              <TouchableOpacity
                style={[
                  forms.input,
                  theme.inputStyle,
                  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                  state.errors.location && { borderColor: theme.colors.error },
                ]}
                onPress={() => setShowLocationOptions(!showLocationOptions)}
              >
                <Text style={theme.textStyle}>
                  {state.location || `${locationOptions[0].emoji} ${locationOptions[0].label}`}
                </Text>
                <Text>▼</Text>
              </TouchableOpacity>
            )}

            {/* Switch back to dropdown button (only shown when in custom mode) */}
            {isCustomLocation && (
              <TouchableOpacity
                style={{ marginTop: 8 }}
                onPress={() => {
                  setIsCustomLocation(false);
                  setShowLocationOptions(true);
                }}
              >
                <Text style={[theme.textStyle, { color: theme.colors.primary }]}>Choose from list</Text>
              </TouchableOpacity>
            )}

            {/* Location dropdown */}
            {showLocationOptions && !isCustomLocation && (
              <View
                style={{
                  marginTop: 4,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  backgroundColor: theme.colors.card,
                  maxHeight: 200,
                }}
              >
                <FlatList
                  data={locationOptions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        padding: spacing.sm,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                      }}
                      onPress={() => handleLocationSelect(item)}
                    >
                      <Text style={theme.textStyle}>
                        {item.emoji} {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            <ErrorMessage message={state.errors.location} theme={theme} />
          </View>

          <TouchableOpacity
            style={[forms.button, forms.primaryButton, { marginTop: spacing.md }]}
            onPress={handleBasicInfoSubmit}
          >
            <Text style={forms.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProjectStatusStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Are you growing any project or business?</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>startup, personal brand, agency, biz...</Text>
        </View>

        <View style={forms.formContainer}>
          {projectStatusOptions.map((option) => (
            <SelectionButton
              key={option.id}
              selected={state.projectStatus === option.id}
              onPress={() => handleProjectStatusSelect(option.id)}
              label={option.label}
              theme={theme}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderProjectTypeStep = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.md,
          paddingBottom: spacing.xxl * 2,
        }}
      >
        <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md, width: "100%" }]}>
          <View style={layout.headerContainer}>
            <Text style={[typography.title, theme.textStyle]}>What is your project about?</Text>
            <Text style={[typography.subtitle, theme.textSecondaryStyle]}>Choose up to 3</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: spacing.md,
              width: "100%",
            }}
          >
            {projectTypes.map((type) => (
              <SelectionButton
                key={type.id}
                selected={state.projectTypes.includes(type.id)}
                onPress={() => handleProjectTypeSelect(type.id)}
                label={type.label}
                emoji={type.emoji}
                theme={theme}
                disabled={!state.projectTypes.includes(type.id) && state.projectTypes.length >= 3}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              forms.button,
              forms.primaryButton,
              { marginTop: spacing.md, width: "100%" },
              state.projectTypes.length === 0 && {
                opacity: 0.5,
                backgroundColor: theme.colors.border,
              },
            ]}
            onPress={handleProjectTypeSubmit}
            disabled={state.projectTypes.length === 0}
          >
            <Text
              style={[
                forms.buttonText,
                state.projectTypes.length === 0 && {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  // Project Description step removed

  const renderPersonalityQuestionsStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={[layout.headerContainer, { width: "100%" }]}>
          <Text style={[typography.title, theme.textStyle]}>{currentQuestion.text}</Text>
        </View>

        {/* Rating cards in a row */}
        <View style={[layout.row, layout.spaceBetween, { width: "100%", marginBottom: spacing.xl }]}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <RatingButton
              key={rating}
              rating={rating}
              selectedRating={selectedRating}
              onPress={() => handleRatingSelect(rating)}
              isLoading={isLoading}
              theme={theme}
            />
          ))}
        </View>

        {/* Labels row */}
        <View style={[layout.row, layout.spaceBetween, { width: "100%", paddingHorizontal: spacing.xs }]}>
          <Text style={[typography.caption, theme.textSecondaryStyle, { flex: 1, textAlign: "left" }]}>disagree</Text>
          <Text style={[typography.caption, theme.textSecondaryStyle, { flex: 1, textAlign: "right" }]}>agree</Text>
        </View>
      </View>
    );
  };

  const renderInterestsSelectionStep = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.md,
          paddingBottom: spacing.xxl * 2,
        }}
      >
        <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md, width: "100%" }]}>
          <View style={layout.headerContainer}>
            <Text style={[typography.title, theme.textStyle]}>Pick 2 of your biggest interests from this list</Text>
            <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
              This doesn't impact your result, but helps us mix you better 💌
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: spacing.md,
              width: "100%",
            }}
          >
            {interestOptions.map((interest) => (
              <SelectionButton
                key={interest.id}
                selected={state.selectedInterests.includes(interest.id)}
                onPress={() => handleInterestSelect(interest.id)}
                label={interest.label}
                emoji={interest.emoji}
                theme={theme}
                disabled={!state.selectedInterests.includes(interest.id) && state.selectedInterests.length >= 2}
              />
            ))}
          </View>

          {/* Add continue button */}
          <TouchableOpacity
            style={[
              forms.button,
              forms.primaryButton,
              { marginTop: spacing.md, width: "100%" },
              state.selectedInterests.length < 2 && {
                opacity: 0.5,
                backgroundColor: theme.colors.border,
              },
            ]}
            onPress={() => setCurrentStep(OnboardingStep.MATCH_REVEAL)}
            disabled={state.selectedInterests.length < 2}
          >
            <Text
              style={[
                forms.buttonText,
                state.selectedInterests.length < 2 && {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingStep.BASIC_INFO:
        return renderBasicInfoStep();
      case OnboardingStep.PROJECT_STATUS:
        return renderProjectStatusStep();
      case OnboardingStep.PROJECT_TYPE:
        return renderProjectTypeStep();
      case OnboardingStep.PERSONALITY_QUESTIONS:
        return renderPersonalityQuestionsStep();
      case OnboardingStep.MATCH_STATS:
        return <MatchStatsComponent theme={theme} onContinue={handleMatchStatsContinue} />;
      case OnboardingStep.INTERESTS_SELECTION:
        return renderInterestsSelectionStep();
      case OnboardingStep.MATCH_REVEAL:
        return <PotentialMatchesComponent theme={theme} onSignUp={handleSignUp} />;
        return null;
    }
  };
  // Only show back button on certain steps
  const showBackButton =
    currentStep > OnboardingStep.BASIC_INFO &&
    currentStep !== OnboardingStep.PERSONALITY_QUESTIONS &&
    currentStep !== OnboardingStep.MATCH_REVEAL;

  return (
    <SafeAreaView
      style={[
        layout.container,
        {
          backgroundColor: theme.colors.background,
          width: "100%",
        },
      ]}
    >
      {/* Back button */}
      {showBackButton && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 50 : 20,
            left: spacing.md,
            zIndex: 10,
          }}
          onPress={handleBack}
        >
          <Text style={[typography.body, theme.textStyle]}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Step content */}
      {renderStepContent()}

      {/* Progress indicator */}
      <ProgressIndicator currentStep={currentStep} currentQuestionIndex={currentQuestionIndex} theme={theme} />
    </SafeAreaView>
  );
}
