import { Image } from 'expo-image';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from './components/ThemedText';
import { ThemedView } from './components/ThemedView';

export default function LandingPage() {
  const hasNavigated = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const navigateToLogin = useCallback(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/(auth)/login');
    }
  }, []);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      navigateToLogin();
    }, 3000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      hasNavigated.current = false;
    };
  }, [navigateToLogin]);

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/logo1.png')}
        style={styles.logo}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <ThemedText type="title" style={styles.welcomeText}>
        Welcome to African Intelligence
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 50,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 24,
  },
}); 