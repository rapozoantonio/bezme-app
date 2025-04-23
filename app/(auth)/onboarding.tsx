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
} from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getThemeStyles, layout, typography, forms, spacing } from "@/styles";
import { personalityQuestions } from "@/constants/PersonalityQuestions";
import { projectTypes, projectStatusOptions } from "@/constants/ProjectQuestionsOptions";
import { interestOptions } from "@/constants/InterestsQuestionsOptions";

// Define onboarding steps
enum OnboardingStep {
  BASIC_INFO = 0,
  PROJECT_STATUS = 1,
  PROJECT_TYPE = 2,
  PROJECT_DESCRIPTION = 3,
  PERSONALITY_QUESTIONS = 4,
  INTERESTS_SELECTION = 5,
  IDENTITY_QUESTION = 6,
  MATCH_REVEAL = 7,
  APP_INVITATION = 8,
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
  projectStatus: string | null;
  projectTypes: string[];
  projectDescription: string;
  personalityAnswers: Record<string, number>;
  selectedInterests: string[];
  identityDescription: string;
  joinEarlyAccess: boolean | null;
  errors: Record<string, string>;
}

// Initial state
const initialState: OnboardingState = {
  fullName: "",
  email: "",
  projectStatus: null,
  projectTypes: [],
  projectDescription: "",
  personalityAnswers: {},
  selectedInterests: [],
  identityDescription: "",
  joinEarlyAccess: null,
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
  const totalSteps = Object.keys(OnboardingStep).length / 2;
  let progress = 0;

  if (currentStep === OnboardingStep.PERSONALITY_QUESTIONS) {
    // For personality questions, combine steps 0-2 (40%) and distribute personality across 40%
    const baseProgress = 40; // First 3 steps (0, 1, 2) = 40%
    const personalityProgress = (currentQuestionIndex / totalQuestions) * 40;
    progress = baseProgress + personalityProgress;
  } else if (currentStep > OnboardingStep.PERSONALITY_QUESTIONS) {
    // After personality questions, we're at 80% complete, and the final 3 steps share the remaining 20%
    const baseProgress = 80; // After personality questions
    const remainingStepsWeight = 20; // Last 3 steps share 20%
    const stepsAfterPersonality = currentStep - OnboardingStep.PERSONALITY_QUESTIONS;
    const additionalProgress = (stepsAfterPersonality / 3) * remainingStepsWeight;
    progress = baseProgress + additionalProgress;
  } else {
    // For initial steps 0-2, each is worth about 13% (40% / 3)
    progress = (currentStep / 3) * 40;
  }

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
      setCurrentStep(OnboardingStep.PROJECT_STATUS);
    }
  };

  const handleProjectStatusSelect = (statusId: string) => {
    dispatch({ type: "SET_FIELD", field: "projectStatus", value: statusId });

    if (statusId === "no") {
      //TODO: Uncomment this when ready - this is just for disconnect party, normally it would not allow users without a project to proceed
      setCurrentStep(OnboardingStep.PERSONALITY_QUESTIONS);
      // Alert.alert(
      //   "Hmm, we might not be a good fit",
      //   "Bezme is designed for entrepreneurs, creators, and business owners. We appreciate your interest, but our platform may not be aligned with your current needs.",
      //   [
      //     {
      //       text: "I understand",
      //       onPress: () => router.push("/(auth)/welcome"),
      //     },
      //   ]
      // );
    } else {
      setCurrentStep(OnboardingStep.PROJECT_TYPE);
    }
  };

  const handleProjectTypeSelect = (typeId: string) => {
    dispatch({ type: "TOGGLE_PROJECT_TYPE", typeId });
  };

  const handleProjectTypeSubmit = () => {
    setCurrentStep(OnboardingStep.PROJECT_DESCRIPTION);
  };

  const handleProjectDescriptionSubmit = () => {
    // Simple validation without dispatching
    if (!state.projectDescription.trim()) {
      // Just don't proceed to the next step
      return;
    }

    // If valid, move to next step
    setCurrentStep(OnboardingStep.PERSONALITY_QUESTIONS);
  };

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
        // All personality questions answered, move to interests selection
        setCurrentStep(OnboardingStep.INTERESTS_SELECTION);
        setSelectedRating(null);
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(navigationTimer);
  };

  const handleInterestSelect = (interestId: string) => {
    dispatch({ type: "TOGGLE_INTEREST", interestId });

    // Check if we now have exactly 2 interests selected
    const updatedInterests = state.selectedInterests.includes(interestId)
      ? state.selectedInterests.filter((id) => id !== interestId)
      : [...state.selectedInterests, interestId].slice(0, 2);

    // Auto-advance if exactly 2 interests are selected
    if (updatedInterests.length === 2 && !state.selectedInterests.includes(interestId)) {
      // Short delay before advancing (for visual feedback)
      setTimeout(() => {
        setCurrentStep(OnboardingStep.IDENTITY_QUESTION);
      }, 500);
    }
  };

  // Handle identity description submit
  const handleIdentitySubmit = () => {
    // Validate description is not empty
    if (!state.identityDescription.trim()) {
      dispatch({
        type: "SET_ERROR",
        field: "identityDescription",
        message: "Please provide a brief description",
      });
      return;
    }

    setCurrentStep(OnboardingStep.MATCH_REVEAL);
  };

  // Handle match reveal continuation
  const handleMatchRevealContinue = () => {
    setCurrentStep(OnboardingStep.APP_INVITATION);
  };

  // Handle app invitation response
  const handleAppInvitationResponse = (joining: boolean) => {
    dispatch({ type: "SET_FIELD", field: "joinEarlyAccess", value: joining });

    // Store data in sessionStorage with the correct keys
    try {
      // Create final onboarding data object
      const finalOnboardingData = {
        ...state,
        joinEarlyAccess: joining,
      };

      // Store complete onboarding data
      sessionStorage.setItem("onboardingData", JSON.stringify(finalOnboardingData));

      // Also store personalityAnswers specifically since register.tsx looks for this key
      sessionStorage.setItem("personalityAnswers", JSON.stringify(state.personalityAnswers));
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }

    // Navigate to the registration screen with the expected parameter regardless of choice
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
      case OnboardingStep.PROJECT_DESCRIPTION:
        setCurrentStep(OnboardingStep.PROJECT_TYPE);
        break;
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

  // Step rendering functions
  const renderBasicInfoStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Let's get to know you</Text>
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

  const renderProjectDescriptionStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>Tell about you or your project 1 sentence</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>The idea I'm building is...</Text>
        </View>

        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <TextInput
              style={[
                forms.input,
                theme.inputStyle,
                { textAlignVertical: "top", minHeight: 100, paddingTop: spacing.sm },
                state.errors.projectDescription && { borderColor: theme.colors.error },
              ]}
              value={state.projectDescription}
              onChangeText={(text) => {
                if (text.length <= 200) {
                  dispatch({ type: "SET_FIELD", field: "projectDescription", value: text });
                }
              }}
              placeholder="Growing a community for young founders & creators..."
              placeholderTextColor={theme.colors.textPlaceholder}
              multiline={true}
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={[typography.caption, theme.textSecondaryStyle, { alignSelf: "flex-end" }]}>
              {state.projectDescription.length}/200
            </Text>
            <ErrorMessage message={state.errors.projectDescription} theme={theme} />
          </View>

          <TouchableOpacity
            style={[
              forms.button,
              forms.primaryButton,
              { marginTop: spacing.md },
              !state.projectDescription.trim() && {
                opacity: 0.5,
                backgroundColor: theme.colors.border,
              },
            ]}
            onPress={handleProjectDescriptionSubmit}
            disabled={!state.projectDescription.trim()}
          >
            <Text style={forms.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        </View>
      </ScrollView>
    );
  };

  // Additional rendering functions for new steps
  const renderIdentityQuestionStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>How could your matches recognize you at the party?</Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle]}>
            Any accessories, outfit part, hair color or whatever you can think of
          </Text>
        </View>

        <View style={forms.formContainer}>
          <View style={forms.inputContainer}>
            <TextInput
              style={[
                forms.input,
                theme.inputStyle,
                { textAlignVertical: "top", minHeight: 100, paddingTop: spacing.sm },
                state.errors.identityDescription && { borderColor: theme.colors.error },
              ]}
              value={state.identityDescription}
              onChangeText={(text) => {
                if (text.length <= 200) {
                  dispatch({ type: "SET_FIELD", field: "identityDescription", value: text });
                }
              }}
              placeholder="Describe how others can recognize you"
              placeholderTextColor={theme.colors.textPlaceholder}
              multiline={true}
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={[typography.caption, theme.textSecondaryStyle, { alignSelf: "flex-end" }]}>
              {state.identityDescription.length}/200
            </Text>
            <ErrorMessage message={state.errors.identityDescription} theme={theme} />
          </View>

          <TouchableOpacity
            style={[forms.button, forms.primaryButton, { marginTop: spacing.md }]}
            onPress={handleIdentitySubmit}
          >
            <Text style={forms.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMatchRevealStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>
            Ready! We'll reveal your matches at 8 pm on Disconnect party
          </Text>
          <Text style={[typography.subtitle, theme.textSecondaryStyle, { marginTop: spacing.md }]}>
            But we have one more surprise for you 🤭
          </Text>
        </View>

        <View style={[forms.formContainer, { marginTop: spacing.xl }]}>
          <TouchableOpacity style={[forms.button, forms.primaryButton]} onPress={handleMatchRevealContinue}>
            <Text style={forms.buttonText}>Tell me!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAppInvitationStep = () => {
    return (
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md }]}>
        <View style={layout.headerContainer}>
          <Text style={[typography.title, theme.textStyle]}>
            Almost there! But before the final step…
          </Text>
          <Text style={[typography.body, theme.textStyle, { marginTop: spacing.md, textAlign: "center" }]}>
            This test is actually a part of an app we’re building to mix you with 3 young founders & creators outside your bubble every month.
          </Text>
          <Text style={[typography.body, theme.textStyle, { marginTop: spacing.md, textAlign: "center" }]}>
            Not just to connect, but to give each other new perspectives and ideas.
          </Text>
          <Text style={[typography.body, theme.textStyle, { marginTop: spacing.md, textAlign: "center" }]}>
            We’ll spill more details soon, but you can join the very first editions for free.
          </Text>
        </View>

        <View style={[forms.formContainer, { marginTop: spacing.xl }]}>
          <TouchableOpacity
            style={[forms.button, forms.primaryButton, { marginBottom: spacing.md }]}
            onPress={() => handleAppInvitationResponse(true)}
          >
            <Text style={forms.buttonText}>I'm in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              forms.button,
              {
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => handleAppInvitationResponse(false)}
          >
            <Text style={[typography.body, theme.textStyle]}>No, thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      case OnboardingStep.PROJECT_DESCRIPTION:
        return renderProjectDescriptionStep();
      case OnboardingStep.PERSONALITY_QUESTIONS:
        return renderPersonalityQuestionsStep();
      case OnboardingStep.INTERESTS_SELECTION:
        return renderInterestsSelectionStep();
      case OnboardingStep.IDENTITY_QUESTION:
        return renderIdentityQuestionStep();
      case OnboardingStep.MATCH_REVEAL:
        return renderMatchRevealStep();
      case OnboardingStep.APP_INVITATION:
        return renderAppInvitationStep();
      default:
        return null;
    }
  };

  // Only show back button on certain steps
  const showBackButton =
    currentStep > OnboardingStep.BASIC_INFO &&
    currentStep !== OnboardingStep.PERSONALITY_QUESTIONS &&
    currentStep !== OnboardingStep.IDENTITY_QUESTION &&
    currentStep !== OnboardingStep.MATCH_REVEAL &&
    currentStep !== OnboardingStep.APP_INVITATION;

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
