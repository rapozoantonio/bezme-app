// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { router } from 'expo-router';
import * as AuthService from '../services/auth';
import { auth } from '../firebase';
import * as WebBrowser from 'expo-web-browser';

// Ensure WebBrowser is registered for Google Auth
WebBrowser.maybeCompleteAuthSession();

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Props type for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isWeb = AuthService.isWeb();
  
  // For native platforms, set up Google Auth
  const googleAuth = isWeb ? null : AuthService.useGoogleAuth();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Register function
  const register = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.registerUser(email, password, displayName);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.loginUser(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in function
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isWeb) {
        // Web implementation
        await AuthService.signInWithGoogleWeb();
      } else {
        // Native implementation
        if (googleAuth) {
          await googleAuth.signInWithGoogle();
        } else {
          throw new Error('Google authentication is not set up properly');
        }
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in');
      console.error('Google sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.logoutUser();
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset function
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.resetPassword(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset');
      console.error('Password reset error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      register,
      login,
      loginWithGoogle,
      logout,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;