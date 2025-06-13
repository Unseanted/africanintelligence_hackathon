import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { IconSymbol } from '../components/IconSymbol';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual login logic
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate based on role
      switch (role) {
        case 'student':
          router.replace('/(tabs)/student');
          break;
        case 'facilitator':
          router.replace('/(tabs)/facilitator');
          break;
        case 'admin':
          router.replace('/(tabs)/admin');
          break;
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <ThemedView style={styles.formContainer}>
          {/* Logo and Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <IconSymbol size={40} color="#eab308" />
            </View>
            <ThemedText style={styles.title}>African Intelligence Login</ThemedText>
            <ThemedText style={styles.subtitle}>
              Reclaim your place in Africa's digital ascent
            </ThemedText>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              theme={{ colors: { primary: '#eab308' } }}
              disabled={isLoading}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              theme={{ colors: { primary: '#eab308' } }}
              disabled={isLoading}
            />

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a</Text>
              <View style={styles.roleButtons}>
                <Button
                  mode={role === 'student' ? 'contained' : 'outlined'}
                  onPress={() => setRole('student')}
                  style={styles.roleButton}
                  theme={{ colors: { primary: '#eab308' } }}
                  disabled={isLoading}
                >
                  Student
                </Button>
                <Button
                  mode={role === 'facilitator' ? 'contained' : 'outlined'}
                  onPress={() => setRole('facilitator')}
                  style={styles.roleButton}
                  theme={{ colors: { primary: '#eab308' } }}
                  disabled={isLoading}
                >
                  Facilitator
                </Button>
              </View>
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              theme={{ colors: { primary: '#eab308' } }}
            >
              {isLoading ? 'Entering...' : 'Enter African Intelligence'}
            </Button>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                New to the tribe?{' '}
                <Text
                  style={styles.registerLink}
                  onPress={() => router.push('/(auth)/register')}
                >
                  Join Now
                </Text>
              </Text>
            </View>
          </View>
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Dark background
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900 with opacity
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)', // gold-300 with opacity
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)', // amber-500 with opacity
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fef3c7', // amber-100
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fcd34d', // amber-300
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800 with opacity
    borderColor: 'rgba(234, 179, 8, 0.2)', // gold-300 with opacity
  },
  roleContainer: {
    marginVertical: 10,
  },
  roleLabel: {
    color: '#fef3c7', // amber-100
    marginBottom: 8,
    fontSize: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
  },
  loginButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#eab308', // amber-500
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#fcd34d', // amber-300
    fontSize: 16,
  },
  registerLink: {
    color: '#eab308', // amber-500
    fontWeight: 'bold',
  },
}); 