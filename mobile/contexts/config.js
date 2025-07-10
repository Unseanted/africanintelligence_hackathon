// config.js
import { Platform } from 'react-native';

// Environment configuration
const ENV = {
  development: {
    BASE_API_URL: Platform.OS === 'ios' 
      ? 'http://localhost:3000/api' 
      : 'http://10.0.2.2:3000/api', // Android emulator
    SOCKET_URL: Platform.OS === 'ios' 
      ? 'http://localhost:3000' 
      : 'http://10.0.2.2:3000',
  },
  production: {
    BASE_API_URL: 'https://your-api-domain.com/api',
    SOCKET_URL: 'https://your-socket-domain.com',
  },
};

// Determine current environment
const currentEnv = __DEV__ ? 'development' : 'production';

// Export configuration
export const BASE_API_URL = ENV[currentEnv].BASE_API_URL;
export const SOCKET_URL = ENV[currentEnv].SOCKET_URL;

// Additional configuration options
export const CONFIG = {
  // Socket.IO options
  socketOptions: {
    transports: ['websocket'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  },
  
  // API configuration
  apiTimeout: 10000,
  
  // AsyncStorage keys
  storageKeys: {
    USER_TOKEN: '@user_token',
    USER_DATA: '@user_data',
    SETTINGS: '@app_settings',
    CHAT_HISTORY: '@chat_history',
  },
  
  // App settings
  app: {
    name: 'Your App Name',
    version: '1.0.0',
  },
};