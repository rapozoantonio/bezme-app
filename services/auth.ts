// services/auth.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  getAuth,
  OAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Verify Firebase initialization
const verifyFirebaseInit = () => {
  if (!db) {
    console.error('Firestore db instance is not initialized!');
    throw new Error('Firebase Firestore not initialized');
  }
};

// Helper function to create or update user document
const saveUserToFirestore = async (user: User, authProvider: string): Promise<void> => {
  verifyFirebaseInit();
  
  try {
    console.log(`Attempting to save user ${user.uid} to Firestore...`);
    const userRef = doc(db, 'users', user.uid);
    
    // Try to get existing document
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log(`Creating new user document for ${user.uid}`);
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        authProvider
      });
      console.log(`Successfully created user document for ${user.uid}`);
    } else {
      // Update last login timestamp
      console.log(`Updating existing user document for ${user.uid}`);
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
        // Update these fields in case they've changed
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, { merge: true });
      console.log(`Successfully updated user document for ${user.uid}`);
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error(`- Error name: ${error.name}`);
      console.error(`- Error message: ${error.message}`);
      console.error(`- Error stack: ${error.stack}`);
    }
    throw error;
  }
};

// Email/Password registration
export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await saveUserToFirestore(userCredential.user, 'email');
    
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Email/Password login
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update user document in Firestore to track login
    try {
      await saveUserToFirestore(userCredential.user, 'email');
    } catch (firestoreError) {
      console.error("Failed to update Firestore after login:", firestoreError);
      // Continue with authentication despite Firestore error
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Google sign-in for web
export const signInWithGoogleWeb = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Get user info
    const user = result.user;
    
    // Update user document in Firestore
    try {
      await saveUserToFirestore(user, 'google');
    } catch (firestoreError) {
      console.error("Failed to update Firestore after Google sign-in:", firestoreError);
      // Continue with authentication despite Firestore error
    }
    
    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Setup Google Auth for native platforms
export const useGoogleAuth = () => {
  // Your Google Web Client ID from Firebase console
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
  
  // Log configuration for debugging
  console.log('Google Auth Config:', { 
    webClientId: webClientId || 'not set',
    platform: Platform.OS
  });
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
  });
  
  return {
    request,
    response,
    promptAsync,
    signInWithGoogle: async () => {
      try {
        const result = await promptAsync();
        if (result?.type === 'success') {
          const { id_token } = result.params;
          
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          
          // Get user info
          const user = userCredential.user;
          
          // Update user document in Firestore
          try {
            await saveUserToFirestore(user, 'google');
          } catch (firestoreError) {
            console.error("Failed to update Firestore after native Google sign-in:", firestoreError);
            // Continue with authentication despite Firestore error
          }
          
          return user;
        }
        throw new Error('Google sign in was cancelled or failed');
      } catch (error) {
        console.error("Google sign-in error:", error);
        throw error;
      }
    }
  };
};

// User logout
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check if platform is web
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};