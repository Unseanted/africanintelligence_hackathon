import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function HomeScreen() {
  useEffect(() => {
    
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/logo1.png')}
        style={styles.logo}
        contentFit="contain"
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
