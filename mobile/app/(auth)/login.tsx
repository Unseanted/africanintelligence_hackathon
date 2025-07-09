import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useTourLMS } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND } from '../constants/colors';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { login, API_URL } = useTourLMS();
  const { toast } = useToast();

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
      androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Optional
      iosClientId: 'YOUR_IOS_CLIENT_ID', // Optional
      scopes: ['profile', 'email'],
      offlineAccess: true,
      hostedDomain: '', // Optional
      forceCodeForRefreshToken: true,
    });
  }, []);

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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices();
      
      // Get the user's ID token
      const userInfo = await GoogleSignin.signIn();
      
      // Get the ID token
      const tokens = await GoogleSignin.getTokens();
      
      // Send the ID token to your backend
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
          role,
          userInfo: {
            id: userInfo.user.id,
            email: userInfo.user.email,
            name: userInfo.user.name,
            photo: userInfo.user.photo,
          },
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
      
      let errorMessage = "Failed to login with Google. Please try again.";
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign in was cancelled";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign in is in progress";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available";
      }
      
      toast({
        title: "Access Denied",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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