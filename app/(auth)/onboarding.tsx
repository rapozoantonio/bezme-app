// app/(auth)/onboarding.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getThemeStyles, layout, typography } from '@/styles';
import { personalityQuestions } from '@/constants/PersonalityQuestions';

export default function OnboardingScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  // Get theme-based styles
  const theme = getThemeStyles(colorScheme as 'light' | 'dark');

  // Get current question
  const currentQuestion = personalityQuestions[currentQuestionIndex];

  // Auto-navigate when a rating is selected
  useEffect(() => {
    if (selectedRating !== null) {
      handleRatingSelected(selectedRating);
    }
  }, [selectedRating]);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    setIsLoading(true);
  };

  const handleRatingSelected = (rating: number) => {
    // Store the answer
    const questionId = currentQuestion.id;
    const newAnswers = { ...answers, [questionId]: rating };
    setAnswers(newAnswers);

    // Short delay to show the selection before moving on
    const navigationTimer = setTimeout(() => {
      if (currentQuestionIndex < personalityQuestions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedRating(null);
        setIsLoading(false);
      } else {
        // All questions answered, navigate to registration
        try {
          // Store answers in sessionStorage
          sessionStorage.setItem('personalityAnswers', JSON.stringify(newAnswers));
        } catch (error) {
          console.error('Failed to save personality answers:', error);
        }
        
        // Navigate to the registration screen
        router.push({
          pathname: '/(auth)/register',
          params: { 
            personalityComplete: 'true'
          }
        });
      }
    }, 150);

    return () => clearTimeout(navigationTimer);
  };

  return (
    <SafeAreaView 
      style={[
        layout.container, 
        { 
          backgroundColor: theme.colors.background,
          width: '100%',
          flex: 1,
          overflow: 'hidden'
        }
      ]}
    >
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 24,
          width: '100%'
        }}
      >
        <View style={[layout.headerContainer, { width: '100%' }]}>
          <Text style={[typography.title, theme.textStyle, { textAlign: 'center', marginBottom: 40 }]}>
            {currentQuestion.text}
          </Text>
        </View>

        {/* Rating cards in a row */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          width: '100%', 
          marginBottom: 30 
        }}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={{
                width: 68,
                height: 68,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: selectedRating === rating ? 
                  theme.colors.primary : 
                  theme.colors.background,
                borderWidth: 1.5,
                borderColor: selectedRating === rating ?
                  theme.colors.primary :
                  theme.colors.border,
                ...(Platform.OS === 'ios' ? {
                  shadowColor: theme.colors.text,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                } : {
                  elevation: 2
                })
              }}
              onPress={() => handleRatingSelect(rating)}
              disabled={isLoading}
            >
              {selectedRating === rating && isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: selectedRating === rating ?
                      '#fff' :
                      theme.colors.text
                  }}
                >
                  {rating}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Labels row */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          width: '100%', 
          paddingHorizontal: 4 
        }}>
          <Text style={[typography.caption, theme.textSecondaryStyle, { flex: 1, textAlign: 'left' }]}>
            disagree
          </Text>
          <Text style={[typography.caption, theme.textSecondaryStyle, { flex: 1, textAlign: 'right' }]}>
            agree
          </Text>
        </View>
        
        {/* Progress indicator */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          justifyContent: 'center', 
          marginTop: 60,
          width: '100%'
        }}>
          {personalityQuestions.map((_, index) => (
            <View 
              key={index}
              style={{ 
                height: 4, 
                width: 8, 
                backgroundColor: index <= currentQuestionIndex ? 
                  theme.colors.primary : theme.colors.border, 
                borderRadius: 2, 
                marginHorizontal: 2,
                marginBottom: 4
              }} 
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}