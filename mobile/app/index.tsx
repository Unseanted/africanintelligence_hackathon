import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

// If using context-based theming
// import { ThemeProvider } from '@/contexts/ThemeContext'; 
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      navigateToLogin();
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
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
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#000000',
  },
});
