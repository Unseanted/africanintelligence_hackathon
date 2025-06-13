import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { router, Link } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { IconSymbol } from '../components/IconSymbol';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      // TODO: Add toast notification
      return;
    }

    if (!agreeTerms) {
      // TODO: Add toast notification
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(tabs)/student');
    } catch (error) {
      console.error('Registration error:', error);
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
            <ThemedText style={styles.title}>Join African Intelligence</ThemedText>
            <ThemedText style={styles.subtitle}>
              Forge your path in the tribe's ascent
            </ThemedText>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <TextInput
              label="Tribal Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: '#eab308' } }}
              disabled={isLoading}
              placeholder="Akin Zulu"
            />

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
              placeholder="you@africanintelligence.com"
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
              placeholder="••••••••"
            />

            {/* Confirm Password Input */}
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
              theme={{ colors: { primary: '#eab308' } }}
              disabled={isLoading}
              placeholder="••••••••"
            />

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I join as a</Text>
              <View style={styles.roleButtons}>
                <Button
                  mode={role === 'facilitator' ? 'contained' : 'outlined'}
                  onPress={() => setRole('facilitator')}
                  style={styles.roleButton}
                  theme={{ colors: { primary: '#eab308' } }}
                  disabled={isLoading}
                >
                  Griot (Facilitator)
                </Button>
                <Button
                  mode={role === 'student' ? 'contained' : 'outlined'}
                  onPress={() => setRole('student')}
                  style={styles.roleButton}
                  theme={{ colors: { primary: '#eab308' } }}
                  disabled={isLoading}
                >
                  Warrior (Student)
                </Button>
              </View>
            </View>

            {/* Terms Agreement */}
            <View style={styles.termsContainer}>
              <Checkbox
                status={agreeTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreeTerms(!agreeTerms)}
                color="#eab308"
                disabled={isLoading}
              />
              <Text style={styles.termsText}>
                I pledge to the{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                  Tribal Code
                </Text>{' '}
                and{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>
                  Sacred Pact
                </Text>
              </Text>
            </View>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              theme={{ colors: { primary: '#eab308' } }}
            >
              {isLoading ? 'Forging Your Path...' : 'Join the Tribe'}
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already in the tribe?{' '}
                <Text
                  style={styles.loginLink}
                  onPress={() => router.push('/(auth)/login')}
                >
                  Enter Now
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  termsText: {
    color: '#fcd34d', // amber-300
    flex: 1,
    marginLeft: 8,
  },
  termsLink: {
    color: '#eab308', // amber-500
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#eab308', // amber-500
  },
  loginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#fcd34d', // amber-300
    fontSize: 16,
  },
  loginLink: {
    color: '#eab308', // amber-500
    fontWeight: 'bold',
  },
}); 