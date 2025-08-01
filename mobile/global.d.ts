/// <reference types="nativewind/types" />

declare module '@react-native-async-storage/async-storage' {
    import AsyncStorage from '@react-native-async-storage/async-storage';
    export default AsyncStorage;
  }
  
  // Optional: Add global type extensions if needed
  declare global {
    // Example: Extend React Native types if necessary
    namespace ReactNative {
      interface ViewProps {
        className?: string;
      }
      interface TextProps {
        className?: string;
      }
      // Add other component props as needed
    }
  
    // Example: Global variable declarations
    // declare var __DEV__: boolean;
  }