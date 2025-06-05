// services/gtm.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from '../firebase';
import { logEvent, Analytics, getAnalytics } from 'firebase/analytics';
import { logger } from '../utils/logger';

// Environment variables for configuration
const GTM_ID = process.env.EXPO_PUBLIC_GTM_ID;
const FIREBASE_MEASUREMENT_ID = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
const IS_DEV = process.env.NODE_ENV !== 'production';

// Extend the Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}

// Store events that happened before tracking was ready
let pendingEvents: Array<{ event: string; data: any }> = [];

// Tracking system ready states
let isGtmReady = false;

// ======== GTM IMPLEMENTATION ========

/**
 * Initialize Google Tag Manager
 */
const initializeGTM = async () => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // Add GTM script to head
        const script = document.createElement('script');
        script.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `;
        document.head.appendChild(script);
        
        // Add GTM noscript iframe for better compatibility
        try {
          const noscript = document.createElement('noscript');
          noscript.innerHTML = `
            <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>
          `;
          if (document.body) {
            document.body.insertBefore(noscript, document.body.firstChild);
          }        } catch (e) {
          logger.warn('Could not add GTM noscript frame:', e);
        }
        
        logger.log('Web GTM initialized successfully with ID:', GTM_ID);
        isGtmReady = true;
      }
    }    // Native implementation
    else {
      logger.log('Native platform detected. GTM functionality limited to Firebase.');
      isGtmReady = true;
    }
    
    // Process any pending events
    if (isGtmReady && pendingEvents.length > 0) {
      logger.log(`Processing ${pendingEvents.length} pending events`);
      pendingEvents.forEach(({ event, data }) => {
        trackEvent(event, data, true); // Pass true to avoid re-queueing
      });
      pendingEvents = [];
    }
      return isGtmReady;
  } catch (error) {
    logger.error('Error initializing GTM:', error);
    isGtmReady = true;
    return true;
  }
};

/**
 * Send event to GTM dataLayer (web only)
 */
const sendToGTM = (event: string, data: any) => {
  // Only for web platform
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }
  
  try {
    // Format GTM event
    const dataLayerObject = {
      event,
      ...data,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };
      // Check if dataLayer exists
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(dataLayerObject);
      logger.log('Pushed to web dataLayer:', event, dataLayerObject);
    } else {
      // DataLayer doesn't exist yet, initialize and try again
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(dataLayerObject);
      logger.log('Created dataLayer and pushed event:', event, dataLayerObject);
    }
  } catch (error) {
    logger.error('Error pushing to GTM dataLayer:', error);
  }
};

// ======== FIREBASE ANALYTICS IMPLEMENTATION ========

// Initialize Firebase Analytics once
let firebaseAnalyticsInstance: Analytics | null = null;

/**
 * Get or initialize Firebase Analytics
 */
const getFirebaseAnalyticsInstance = () => {
  if (firebaseAnalyticsInstance) {
    return firebaseAnalyticsInstance;
  }
    try {
    // Get analytics from app
    firebaseAnalyticsInstance = getAnalytics(app);
    logger.log('Firebase Analytics initialized with measurement ID:', FIREBASE_MEASUREMENT_ID);
    return firebaseAnalyticsInstance;
  } catch (error) {
    logger.error('Error initializing Firebase Analytics:', error);
    return null;
  }
};

// Initialize Firebase Analytics on module load
getFirebaseAnalyticsInstance();

/**
 * Send event to Firebase Analytics
 */
const sendToFirebaseAnalytics = (event: string, data: any) => {
  try {
    // Get Firebase Analytics instance
    const firebaseAnalytics = getFirebaseAnalyticsInstance();
      if (!firebaseAnalytics) {
      logger.warn('Firebase Analytics not available, event not sent:', event);
      return;
    }
    
    // Format event name for Firebase (40 char limit, alphanumeric + underscores)
    const safeEventName = event.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
    
    // Format parameters for Firebase
    const safeParams: Record<string, string | number> = {
      platform: Platform.OS
    };
    
    // Process data to ensure it's compatible with Firebase Analytics
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'string' || typeof value === 'number') {
        // Truncate string values to 100 characters as per Firebase limits
        safeParams[key] = typeof value === 'string' ? value.substring(0, 100) : value;
      } else if (value != null) {
        // Convert other types to strings
        safeParams[key] = JSON.stringify(value).substring(0, 100);
      }
    });
      // Send to Firebase
    logEvent(firebaseAnalytics, safeEventName, safeParams);
    logger.log('Firebase Analytics event sent:', safeEventName, safeParams);
  } catch (error) {
    logger.error('Error sending to Firebase Analytics:', error, 'Event:', event);
  }
};

// ======== UNIFIED TRACKING INTERFACE ========

/**
 * Store events in AsyncStorage for debugging
 */
const storeEventForDebug = async (event: any) => {
  try {
    // Get existing events
    const existingEventsString = await AsyncStorage.getItem('analytics_events');
    let existingEvents = existingEventsString ? JSON.parse(existingEventsString) : [];
    
    // Add new event
    existingEvents.push({
      ...event,
      clientTimestamp: new Date().toISOString(),
    });
    
    // Keep only the last 50 events
    if (existingEvents.length > 50) {
      existingEvents = existingEvents.slice(-50);
    }
      // Save back to AsyncStorage
    await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
  } catch (error) {
    logger.error('Error storing event for debug:', error);
  }
};

/**
 * Main tracking function - sends event to all analytics platforms
 * @param event The event name
 * @param data The event data
 * @param fromQueue Whether this event is being processed from the queue
 */
export const trackEvent = async (event: string, data: any = {}, fromQueue = false) => {
  // Validate input
  if (!event) {
    logger.error('Event name is required for tracking');
    return;
  }
  
  // If tracking not ready and not from queue, store for later
  if (!isGtmReady && !fromQueue) {
    pendingEvents.push({ event, data });
    logger.log(`Tracking not ready. Queued event: ${event}`);
    return;
  }

  // Log the event for debugging
  logger.log('Tracking event:', event, data);

  // 1. Send to Google Tag Manager
  sendToGTM(event, data);
  
  // 2. Send to Firebase Analytics
  sendToFirebaseAnalytics(event, data);
  
  // 3. Store for debugging
  const debugEvent = {
    event,
    ...data,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  };
  storeEventForDebug(debugEvent);
  
  // 4. Return success
  return true;
};

// Backwards compatibility for existing code
export const pushToDataLayer = trackEvent;

// Initialize tracking on module load
initializeGTM();

// ======== EVENT DEFINITIONS AND HELPER FUNCTIONS ========

// Event types enum
export enum GTMEvents {
  ABOUT_YOURSELF_ANSWERED = 'about_yourself_answered',
  GROWING_PROJECT_ANSWERED = 'growing_any_project_answered',
  PROJECT_CATEGORY_ANSWERED = 'project_category_about_answered',
  TELL_ABOUT_PROJECT_ANSWERED = 'tell_about_project_answered',
  PERSONALITY_QUESTION_ANSWERED = 'personality_question_answered',
  MATCHES_COMPATIBILITY_FUNNEL = 'matches_compatibility_funnel',
  INTERESTS_ANSWERED = 'interests_answered',
  HOW_RECOGNIZE_ANSWERED = 'how_recognize_answered',
  ONE_MORE_SURPRISE_FUNNEL = 'one_more_surprise_funnel',
  WHAT_WE_WILL_DO_ANSWERED = 'what_we_will_do_answered',
  MATCHES_PROFILES_FUNNEL = 'matches_profiles_funnel',
  CREATE_ACCOUNT = 'create_account',
  SIGN_IN_GMAIL = 'sign_in_gmail',
}

/**
 * Track personality question answered
 */
export const trackPersonalityQuestion = (questionId: string, selectedValue: number) => {
  trackEvent(GTMEvents.PERSONALITY_QUESTION_ANSWERED, {
    question_id: questionId,
    selected_value: selectedValue
  });
};

/**
 * Track project status answered
 */
export const trackProjectStatus = (selectedValue: string) => {
  trackEvent(GTMEvents.GROWING_PROJECT_ANSWERED, {
    question_id: 'growing project or business',
    selected_value: selectedValue
  });
};

/**
 * Track project category answered
 */
export const trackProjectCategory = (selectedValue: string) => {
  trackEvent(GTMEvents.PROJECT_CATEGORY_ANSWERED, {
    question_id: 'project category',
    selected_value: selectedValue
  });
};

/**
 * Track interests selected
 */
export const trackInterests = (selectedInterests: string[]) => {
  trackEvent(GTMEvents.INTERESTS_ANSWERED, {
    question_id: 'interests',
    selected_value: selectedInterests.join(',')
  });
};

/**
 * Track what we'll do together answer
 */
export const trackWhatWeWillDo = (selectedValue: string) => {
  trackEvent(GTMEvents.WHAT_WE_WILL_DO_ANSWERED, {
    question_id: 'do together',
    selected_value: selectedValue
  });
};

/**
 * Track account creation
 */
export const trackCreateAccount = () => {
  trackEvent(GTMEvents.CREATE_ACCOUNT);
};

/**
 * Track Google sign in
 */
export const trackGoogleSignIn = () => {
  trackEvent(GTMEvents.SIGN_IN_GMAIL);
};

/**
 * Debug helper: Send a test event to verify tracking is working
 */
export const sendTestEvent = () => {
  trackEvent('test_event', {
    timestamp: new Date().toISOString(),
    test_param: 'test_value'
  });
};

/**
 * Debug helper: Get analytics configuration and status
 */
export const getAnalyticsStatus = async () => {
  const events = await AsyncStorage.getItem('analytics_events');
  return {
    gtm: {
      isReady: isGtmReady,
      id: GTM_ID,
      pendingEvents: pendingEvents.length
    },
    firebase: {
      isInitialized: !!firebaseAnalyticsInstance,
      measurementId: FIREBASE_MEASUREMENT_ID
    },
    platform: Platform.OS,
    storedEvents: events ? JSON.parse(events).length : 0,
    timestamp: new Date().toISOString()
  };
};