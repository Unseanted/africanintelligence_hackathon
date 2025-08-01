import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TourLMSProvider, useTourLMS } from "./contexts/TourLMSContext";

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, token, loading } = useTourLMS();
  const isNavigating = useRef(false);

  const navigateToAuth = useCallback(() => {
    if (isNavigating.current || loading) return;

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === "(auth)";
    const isLandingPage = !segments.length || currentSegment === "index";

    if (!user && !token && !inAuthGroup && !isLandingPage) {
      isNavigating.current = true;
      try {
        router.replace("/(auth)/login");
      } catch (error) {
        console.warn("Navigation error:", error);
      } finally {
        isNavigating.current = false;
      }
    }
  }, [router, user, token, segments, loading]);

  useEffect(() => {
    navigateToAuth();
  }, [navigateToAuth]);
}

function AppContent() {
  const { loading } = useTourLMS();
  const splashHidden = useRef(false);

  useProtectedRoute();

  useEffect(() => {
    if (!loading && !splashHidden.current) {
      splashHidden.current = true;
      setTimeout(() => {
        SplashScreen.hideAsync().catch((error) => {
          console.warn("Error hiding splash screen:", error);
        });
      }, 500);
    }
  }, [loading]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#1f2937' }}>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        <Slot />
        <Toast />
      </View>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  return (
    <PaperProvider>
      <AppContent />
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