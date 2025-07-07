import Constants from 'expo-constants';

// Get API URL from environment variables with fallback
const getApiUrl = (): string => {
  // Try to get from expo constants (expo-env)
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl || 
                   process.env.EXPO_PUBLIC_API_URL || 
                   process.env.API_URL;
  
  if (envApiUrl) {
    return envApiUrl;
  }

  // Fallback based on environment
  if (__DEV__) {
    // Development - use localhost or your dev server
    return 'http://localhost:3000/api';
  } else {
    // Production - replace with your production API URL
    return 'https://your-production-api.com/api';
  }
};

// Google OAuth Configuration
const getGoogleConfig = () => {
  return {
    expoClientId: Constants.expoConfig?.extra?.googleExpoClientId || 
                  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
                  'your-expo-client-id.googleusercontent.com',
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId || 
                     process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
                     'your-android-client-id.googleusercontent.com',
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId || 
                 process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
                 'your-ios-client-id.googleusercontent.com'
  };
};

// App Configuration
const getAppConfig = () => {
  return {
    name: Constants.expoConfig?.name || 'TourLMS',
    version: Constants.expoConfig?.version || '1.0.0',
    scheme: Constants.expoConfig?.scheme || 'tourlms'
  };
};

export const API_URL = getApiUrl();
export const GOOGLE_CONFIG = getGoogleConfig();
export const APP_CONFIG = getAppConfig();

// Export individual values for backward compatibility
export const {
  expoClientId: GOOGLE_EXPO_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID
} = GOOGLE_CONFIG;

// Debug logging in development
if (__DEV__) {
  console.log('API Configuration:', {
    API_URL,
    GOOGLE_CONFIG,
    APP_CONFIG
  });
}