import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Platform } from "react-native";
import { calculatePersonality } from "./utils/personalityCalculator";
import { logger } from "./utils/logger";

// Validate configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log configuration status
logger.info('Firebase config status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasMeasurementId: !!firebaseConfig.measurementId,
  environment: process.env.NODE_ENV
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize authentication and firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

// ======== FIREBASE SERVICE FUNCTIONS ========

/**
 * Save partial onboarding data for marketing purposes
 * @param {Object} basicInfo - Basic user information collected during onboarding
 * @returns {Promise<string|null>} - Session ID or null if operation failed
 */
export const savePartialOnboardingData = async (basicInfo: Record<string, any>) => {
  try {
    // Generate a unique ID for anonymous users
    const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Store the session ID for potential future use
    try {
      sessionStorage.setItem('onboardingSessionId', sessionId);
    } catch (err) {
      // Silent fail if sessionStorage isn't available
      console.log("Session storage not available, continuing without storing sessionId locally");
    }
    
    // Save to dedicated collection for marketing
    await setDoc(doc(db, "partialOnboarding", sessionId), {
      ...basicInfo,
      timestamp: new Date().toISOString(),
      platform: Platform.OS || 'web',
      onboardingStep: "BASIC_INFO_COMPLETED",
      status: "INCOMPLETE"
    });
    
    return sessionId;
  } catch (error) {
    console.error("Error saving partial onboarding data:", error);
    return null;
  }
};

/**
 * Retrieves user data from Firestore
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUserData = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

/**
 * Save complete onboarding data for a registered user
 * @param {string} userId - Firebase Auth user ID
 * @param {Object} personalityAnswers - User's personality quiz answers
 * @param {Object} onboardingData - Complete onboarding data
 * @returns {Promise<boolean>} - Success status
 */
export const saveOnboardingData = async (userId: string, personalityAnswers: Record<string, any>, onboardingData?: {
  fullName?: string;
  email?: string;
  location?: string;
  projectStatus?: string;
  projectTypes?: string[];
  selectedInterests?: string[];
}) => {
  try {
    // Calculate personality type based on answers
    const personalityResult = calculatePersonality(personalityAnswers);
    
    // Prepare the data to save
    const userData = {
      personalityAnswers,
      personalityResult,
      personalityComplete: true,
      ...(onboardingData && {
        fullName: onboardingData.fullName,
        email: onboardingData.email,
        location: onboardingData.location,
        projectStatus: onboardingData.projectStatus,
        projectTypes: onboardingData.projectTypes,
        selectedInterests: onboardingData.selectedInterests,
        onboardingComplete: true,
        testParticipant: false,
      }),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    
    // Update the user document
    await setDoc(doc(db, "users", userId), userData, { merge: true });
    
    // Try to link with any partial onboarding records
    try {
      const sessionId = sessionStorage.getItem('onboardingSessionId');
      if (sessionId) {
        await setDoc(doc(db, "partialOnboarding", sessionId), {
          convertedToUserId: userId,
          conversionDate: new Date().toISOString(),
          status: "CONVERTED"
        }, { merge: true });
        
        // Clear session ID after use
        sessionStorage.removeItem('onboardingSessionId');
      }
    } catch (err) {
      // Silent fail if sessionStorage isn't available
      console.log("Session storage not available, continuing without linking partial record");
    }
    
    return true;
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    throw error;
  }
};

/**
 * Check if user has completed onboarding
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<boolean>} - True if onboarding is complete
 */
export const hasCompletedOnboarding = async (userId: string) => {
  try {
    const userData = await getUserData(userId);
    return !!(userData && (userData.onboardingComplete || userData.personalityComplete));
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};