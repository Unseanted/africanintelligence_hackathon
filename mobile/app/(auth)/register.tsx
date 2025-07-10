import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { useTourLMS } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND } from '../constants/colors';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

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
  const { register, API_URL } = useTourLMS();
  const { toast } = useToast();

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
      iosClientId: 'YOUR_IOS_CLIENT_ID', // Optional, if you have a separate iOS client ID
      scopes: ['profile', 'email'],
      offlineAccess: true,
      hostedDomain: '', // Optional
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices();
      
      // Get the user's ID token
      const userInfo = await GoogleSignin.signIn();
      
      // Send the ID token to your backend
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userInfo.idToken || userInfo.user?.idToken,
          role,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.user && result.token) {
        await register({
          name: result.user.name,
          email: result.user.email,
          password: '',
          role: result.user.role
        });
        toast({
          title: "Tribe Welcomes You!",
          description: "You've joined African Intelligence. Onward to greatness!",
        });
        router.replace('/screens/(tabs)/student');
      } else {
        throw new Error(result.message || 'Google signup failed');
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      
      let errorMessage = "Failed to signup with Google. Please try again.";
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Google sign-in was cancelled.";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Google sign-in is already in progress.";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services is not available or outdated.";
      }
      
      toast({
        title: "Entry Denied",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, role, register, toast]);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Ensure your passwords align, warrior.",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "Tribal Pact",
        description: "Accept the tribe's code to join the ascent.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userData = { name, email, password, role };
      await register(userData);
      toast({
        title: "Tribe Welcomes You!",
        description: "You've joined African Intelligence. Onward to greatness!",
      });
      router.replace('/screens/(tabs)/student');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Entry Denied",
        description: error.message || "The tribe couldn't forge your path. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: TEXT_PRIMARY }]}>
              Join African Intelligence
            </Text>
            <Text style={[styles.subtitle, { color: TEXT_SECONDARY }]}>
              Forge your path in the tribe&apos;s ascent
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Tribal Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: PRIMARY } }}
              disabled={isLoading}
              placeholder="Akin Zulu"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              theme={{ colors: { primary: PRIMARY } }}
              disabled={isLoading}
              placeholder="you@africanintelligence.com"
            />

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
              theme={{ colors: { primary: PRIMARY } }}
              disabled={isLoading}
              placeholder="••••••••"
            />

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
              theme={{ colors: { primary: PRIMARY } }}
              disabled={isLoading}
              placeholder="••••••••"
            />

            <View style={styles.roleContainer}>
              <Text style={[styles.roleLabel, { color: TEXT_PRIMARY }]}>I join as a</Text>
              <View style={styles.roleButtons}>
                <Button
                  mode={role === 'facilitator' ? 'contained' : 'outlined'}
                  onPress={() => setRole('facilitator')}
                  style={styles.roleButton}
                  theme={{ colors: { primary: PRIMARY } }}
                  disabled={isLoading}
                >
                  Griot (Facilitator)
                </Button>
                <Button
                  mode={role === 'student' ? 'contained' : 'outlined'}
                  onPress={() => setRole('student')}
                  style={styles.roleButton}
                  theme={{ colors: { primary: PRIMARY } }}
                  disabled={isLoading}
                >
                  Warrior (Student)
                </Button>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <Checkbox
                status={agreeTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreeTerms(!agreeTerms)}
                color={PRIMARY}
                disabled={isLoading}
              />
              <Text style={[styles.termsText, { color: TEXT_SECONDARY }]}>
                I pledge to the{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/(auth)/terms' as any)}>
                  Tribal Code
                </Text>{' '}
                and{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/(auth)/privacy' as any)}>
                  Sacred Pact
                </Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              theme={{ colors: { primary: PRIMARY } }}
            >
              {isLoading ? 'Forging Your Path...' : 'Join the Tribe'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              style={styles.googleButton}
              icon="google"
            >
              Continue with Google
            </Button>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: TEXT_SECONDARY }]}>
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
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  roleContainer: {
    marginVertical: 10,
  },
  roleLabel: {
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
    flex: 1,
    marginLeft: 8,
  },
  termsLink: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  googleButton: {
    marginTop: 8,
    borderColor: PRIMARY,
  },
  loginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
});