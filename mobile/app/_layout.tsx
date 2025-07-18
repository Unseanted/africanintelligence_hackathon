// _layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { TourLMSProvider, useTourLMS } from "./contexts/TourLMSContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, token, loading } = useTourLMS();
  const isNavigating = useRef(false);

  useEffect(() => {
    // Don't run the auth check while still loading
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isLandingPage = segments[0] === undefined;

    if (isNavigating.current) return;

    if (!user && !token && !inAuthGroup && !isLandingPage) {
      isNavigating.current = true;
      router.replace("/(auth)/login");
    } else if (user && token && (inAuthGroup || isLandingPage)) {
      isNavigating.current = true;
      router.replace("./student");
    }

    return () => {
      isNavigating.current = false;
    };
  }, [user, token, segments, router, loading]);
}

function AppContent() {
  const { loading } = useTourLMS();
  const { colors } = useTheme(); // Use theme colors
  useProtectedRoute();

  useEffect(() => {
    if (!loading) {
      // Hide splash screen once we're done loading
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [loading]);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor moved to dynamic styling in AppContent
  },
});