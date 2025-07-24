// app/_layout.tsx or app/RootLayout.tsx
import React, { useEffect, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { TourLMSProvider, useTourLMS } from './contexts/TourLMSContext';
import { ThemeProvider } from './context/ThemeContext';

const BACKGROUND = '#111827';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { user, token, loading } = useTourLMS();
  const segments = useSegments();
  const router = useRouter();
  const isNavigating = useRef(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isLandingPage = segments.length === 0;

    if (isNavigating.current) return;

    if (!user && !token && !inAuthGroup && !isLandingPage) {
      isNavigating.current = true;
      router.replace('/(auth)/login');
    } else if (user && token && (inAuthGroup || isLandingPage)) {
      isNavigating.current = true;
      router.replace('/(tabs)/student');
    }

    return () => {
      isNavigating.current = false;
    };
  }, [user, token, loading, segments]);
}

function AppContent() {
  const { loading } = useTourLMS();
  useProtectedRoute();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(console.warn);
  }, [loading]);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <Slot />
        <Toast />
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TourLMSProvider>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
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
