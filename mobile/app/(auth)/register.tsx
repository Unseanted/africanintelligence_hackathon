import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useToast } from "../../hooks/use-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useTourLMS } from "../contexts/TourLMSContext";

export default function Register() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { register, user } = useTourLMS();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered don't match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role: "student", // Default role for new registrations
      });
      
      toast({
        title: "Welcome to the Tribe!",
        description: "Your account has been created successfully.",
      });
      
      // Redirect after successful registration
      router.replace("/screens/(tabs)/student");
    } catch (error) {
      console.error("Registration error:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : "The tribe couldn't complete your registration. Try again.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.formContainer, {
          backgroundColor: colors.cardBackground,
          borderColor: colors.primary + '33'
        }]}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, {
              backgroundColor: colors.primary + '33'
            }]}>
              <Image
                source={require("@/assets/images/home.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Join African Intelligence
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Begin your journey with the tribe
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={[styles.input, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.primary + '33'
              }]}
              theme={{ colors: { primary: colors.primary } }}
              disabled={isLoading}
              placeholder="Your full name"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.primary + '33'
              }]}
              theme={{ colors: { primary: colors.primary } }}
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
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color={colors.primary}
                />
              }
              style={[styles.input, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.primary + '33'
              }]}
              theme={{ colors: { primary: colors.primary } }}
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
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color={colors.primary}
                />
              }
              style={[styles.input, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.primary + '33'
              }]}
              theme={{ colors: { primary: colors.primary } }}
              disabled={isLoading}
              placeholder="••••••••"
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              theme={{ colors: { primary: colors.primary } }}
              labelStyle={{ color: colors.onPrimary }}
            >
              {isLoading ? "Joining..." : "Join the Tribe"}
            </Button>

            {__DEV__ && (
              <Button
                mode="outlined"
                onPress={() => {
                  setName("Test User");
                  setEmail("test@example.com");
                  setPassword("password123");
                  setConfirmPassword("password123");
                }}
                style={styles.testButton}
                theme={{ colors: { primary: colors.primary } }}
              >
                Use Test Data
              </Button>
            )}

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already a member?{" "}
                <Text
                  style={[styles.loginLink, { color: colors.primary }]}
                  onPress={() => router.push("/(auth)/login")}
                >
                  Sign In
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
    marginVertical: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
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
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  input: {
    borderRadius: 4,
    borderWidth: 1,
  },
  registerButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  testButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  loginContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontWeight: "bold",
  },
});