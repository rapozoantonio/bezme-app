import { Image, TouchableOpacity, useColorScheme, ViewStyle, ImageStyle } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { db } from '../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import styles, { colors, spacing, typography, layout, forms } from '@/styles/index';

export default function HomeScreen() {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const themeStyles = styles.getThemeStyles(colorScheme);
  const router = useRouter();
  
  type UserData = {
    displayName: string;
    photoURL: string | null;
    onboardingComplete?: boolean;
    personalityComplete?: boolean;
  };

  const [userData, setUserData] = useState<UserData>({
    displayName: '',
    photoURL: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("INDEX: Auth state changed, user:", !!user);
      
      if (user) {
        // User is signed in
        try {
          // Fetch the user's own document using their UID
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const firebaseUserData = userDocSnap.data();
            console.log("INDEX: Got user data from Firestore:", 
              "onboardingComplete:", firebaseUserData.onboardingComplete,
              "personalityComplete:", firebaseUserData.personalityComplete);
            
            // Check if user has completed onboarding in Firestore
            if (!firebaseUserData.onboardingComplete && !firebaseUserData.personalityComplete) {
              console.log("INDEX: User needs to complete onboarding flow");
              
              // Only redirect if we haven't already checked (prevents infinite redirects)
              if (!checkedOnboarding) {
                setCheckedOnboarding(true);
                // Make sure gateway access is set for the onboarding flow
                try {
                  localStorage.setItem('gateway_access_granted', 'true');
                } catch (err) {
                  console.error('Failed to set gateway access:', err);
                }
                router.replace('/(auth)/welcome');
                return;
              }
            } else {
              // User has completed onboarding, set user data
              console.log("INDEX: User has already completed onboarding, showing home page");
              setUserData({
                displayName: firebaseUserData.displayName || user.displayName || 'User',
                photoURL: firebaseUserData.photoURL || user.photoURL || null,
                onboardingComplete: firebaseUserData.onboardingComplete,
                personalityComplete: firebaseUserData.personalityComplete
              });
            }
          } else {
            // Document doesn't exist but user is authenticated
            console.log("INDEX: User authenticated but no Firestore profile found");
            setUserData({
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || null,
            });
            
            // Only redirect if we haven't already checked (prevents infinite redirects)
            if (!checkedOnboarding) {
              setCheckedOnboarding(true);
              // Make sure gateway access is set for the onboarding flow
              try {
                localStorage.setItem('gateway_access_granted', 'true');
              } catch (err) {
                console.error('Failed to set gateway access:', err);
              }
              router.replace('/(auth)/welcome');
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Could not load your profile');
        }
      } else {
        // User is not signed in - should be handled by the tabs layout
        console.log("INDEX: No user found, should be handled by tabs layout");
        setUserData({
          displayName: 'Demo User',
          photoURL: null,
        });
      }
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [router, checkedOnboarding]);

  const profileImageStyle: ImageStyle = {
    height: 120,
    width: 120,
    borderRadius: 60,
    bottom: 20,
    alignSelf: 'center' as const,
    position: 'absolute' as const,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ 
        light: colors.light.background, 
        dark: colors.dark.background 
      }}
      headerImage={
        userData.photoURL ? (
          <Image
            source={{ uri: userData.photoURL }}
            style={profileImageStyle}
          />
        ) : (
          <ThemedView
            style={{
              ...profileImageStyle,
              backgroundColor: colorScheme === 'light' ? colors.light.card : colors.dark.card,
            }}
          />
        )
      }>
      <ThemedView
        style={{
          ...layout.container,
          padding: spacing.md,
          alignItems: 'center',
        }}>
        {loading ? (
          <ThemedText type="title">Loading...</ThemedText>
        ) : error ? (
          <ThemedText
            type="title"
            style={themeStyles.errorTextStyle}>
            {error}
          </ThemedText>
        ) : (
          <>
            <ThemedText
              type="title"
              style={{
                fontSize: 28,
                marginTop: spacing.xl,
                textAlign: 'center',
                marginBottom: spacing.md,
              }}>
              Hi, {userData.displayName}!
            </ThemedText>
            
            <ThemedView
              style={{
                marginVertical: spacing.md,
                padding: spacing.md,
                backgroundColor: colorScheme === 'light' 
                  ? colors.light.successBackground 
                  : colors.dark.successBackground,
                borderRadius: 15,
                width: '100%',
              }}>
              <ThemedText
                type="subtitle"
                style={{
                  textAlign: 'center',
                  fontSize: 22,
                }}>
                Done! And get ready to meet your matches tonight😉
              </ThemedText>
            </ThemedView>
            
            <ThemedText
              style={{
                textAlign: 'center',
                marginVertical: spacing.md,
                fontSize: 16,
                opacity: 0.8,
              }}>
              We're connecting you with 3 young founders & creators outside your bubble every month.
              Not just to connect, but to give each other new perspectives and ideas.
            </ThemedText>
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}