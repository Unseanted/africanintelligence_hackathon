import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useTourLMS } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND } from '../constants/colors';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { login, API_URL } = useTourLMS();
  const { toast } = useToast();

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_EXPO_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    scopes: ['profile', 'email'],
    redirectUri: 'exp://localhost:19000/--/oauth2redirect/google'
  });

  // Safe navigation function
  const navigateToApp = () => {
    try {
      router.replace('/' as any); // Navigate to root
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push('/');
    }
  };

  const handleGoogleResponse = useCallback(async (token: string | undefined) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          role,
        }),
      });

      const result = await response.json();
      if (response.ok && result.user && result.token) {
        // Store authentication data in context
        await login(result.user.email, '');
        
        toast({
          title: "Access Granted!",
          description: `Welcome back, ${result.user.name}, to African Intelligence!`,
        });
        
        // Navigate to main app
        navigateToApp();
      } else {
        throw new Error(result.message || 'Google login failed');
      }
    } catch (error: any) {
      console.error("Google Login error:", error);
      toast({
        title: "Access Denied",
        description: error.message || "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, login, role, toast]);

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication?.accessToken);
    }
  }, [response, handleGoogleResponse]);

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      
      toast({
        title: "Access Granted!",
        description: "Welcome back to African Intelligence!",
      });
      
      // Navigate to main app
      navigateToApp();
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/logo1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: TEXT_PRIMARY }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: TEXT_SECONDARY }]}>
          Sign in to continue your learning journey
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            theme={{ colors: { primary: PRIMARY } }}
            disabled={loading}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: PRIMARY } }}
            disabled={loading}
          />
          
          <View style={[styles.roleSelector, { opacity: loading ? 0.5 : 1 }]}>
            <Text style={[styles.roleLabel, { color: TEXT_PRIMARY }]}>
              Login as:
            </Text>
            <SegmentedButtons
              value={role}
              onValueChange={setRole}
              buttons={[
                { value: 'student', label: 'Student' },
                { value: 'facilitator', label: 'Facilitator' },
              ]}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={PRIMARY}
          >
            {loading ? "Entering..." : "Enter African Intelligence"}
          </Button>

          <Button
            mode="outlined"
            onPress={handleGoogleLogin}
            disabled={loading}
            style={styles.googleButton}
            icon="google"
          >
            Continue with Google
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/register')}
            style={styles.registerButton}
            disabled={loading}
          >
            Don&apos;t have an account? Register here
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: CARD_BACKGROUND,
  },
  roleSelector: {
    marginVertical: 8,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  googleButton: {
    marginTop: 8,
    borderColor: PRIMARY,
  },
  registerButton: {
    marginTop: 16,
  },
});