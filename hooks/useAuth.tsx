// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
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

  // Register function - no navigation
  const register = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.registerUser(email, password, displayName);
      // No navigation here - components will handle it based on auth state
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
      throw err; // Rethrow to let component handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Login function - no navigation
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.loginUser(email, password);
      // No navigation here - components will handle it based on auth state
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
      throw err; // Rethrow to let component handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in function - no navigation
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
      // No navigation here - components will handle it based on auth state
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in');
      console.error('Google sign-in error:', err);
      throw err; // Rethrow to let component handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function - keep navigation for now as it's less problematic
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.logoutUser();
      
      // For logout, we'll also clear the gateway access
      try {
        localStorage.removeItem('gateway_access_granted');
      } catch (err) {
        console.error('Failed to clear gateway access:', err);
      }
      
      // Navigation can remain here for logout since it's not related to our issue
      // but could be moved to components later for consistency
      const { router } = require('expo-router');
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      console.error('Logout error:', err);
      throw err; // Rethrow to let component handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset function - no changes needed
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