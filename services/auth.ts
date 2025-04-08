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

// Email/Password registration
export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      photoURL: null,
      authProvider: 'email'
    });
    
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
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // If user doesn't exist, create a new document
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        authProvider: 'google'
      });
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
          
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          // If user doesn't exist, create a new document
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              authProvider: 'google'
            });
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