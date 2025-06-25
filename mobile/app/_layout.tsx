import React, { useEffect, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { TourLMSProvider, useTourLMS } from './contexts/TourLMSContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import ThemeProvider from './context/ThemeContext';

// Color Constants
const BACKGROUND = '#111827';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, token } = useTourLMS();
  const isNavigating = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const isLandingPage = segments[0] === undefined;

    if (isNavigating.current || isLandingPage) return;

    if (!user && !token && !inAuthGroup) {
      isNavigating.current = true;
      router.replace('/(auth)/login');
    } else if (user && token && inAuthGroup) {
      isNavigating.current = true;
      router.replace('/(tabs)/student');
    }

    return () => {
      isNavigating.current = false;
    };
  }, [user, token, segments, router]);
}

function AppContent() {
  const { loading } = useTourLMS();
  useProtectedRoute();

  useEffect(() => {
    if (!loading) {
      // Hide splash screen once we're done loading
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { pointerEvents: 'auto' }]}>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  return (
    <PaperProvider>
      <AppContent />
      <Toast />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TourLMSProvider>
        <RootLayoutNav />
      </TourLMSProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
});
