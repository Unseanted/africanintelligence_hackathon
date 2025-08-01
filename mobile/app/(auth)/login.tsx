import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useToast } from "../../hooks/use-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useTourLMS } from "../contexts/TourLMSContext";

export default function Login() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  const { login, user } = useTourLMS(); // Removed socket from destructuring

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/screens/(tabs)/student");
    }
  }, [user, isReady]);

  useEffect(() => {
    const autoLogin = async () => {
      if (__DEV__ && !user && isReady) {
        setIsLoading(true);
        try {
          await login(email, password);
          toast({
            title: "Automatic Login Successful",
            description: "You've been automatically logged in for testing purposes.",
          });
        } catch (error) {
          console.error("Auto-login failed:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    autoLogin();
  }, [isReady]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Welcome Back!",
        description: "You've entered African Intelligence. Continue your ascent!",
      });
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : "The tribe couldn't verify your path. Try again.";
      toast({
        title: "Entry Denied",
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
              Enter African Intelligence
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Continue your path in the tribe's ascent
            </Text>
          </View>

          <View style={styles.form}>
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

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              theme={{ colors: { primary: colors.primary } }}
              labelStyle={{ color: colors.onPrimary }}
            >
              {isLoading ? "Entering..." : "Enter the Tribe"}
            </Button>

            {__DEV__ && (
              <Button
                mode="outlined"
                onPress={() => {
                  setEmail("test@example.com");
                  setPassword("password123");
                }}
                style={styles.testButton}
                theme={{ colors: { primary: colors.primary } }}
              >
                Use Test Credentials
              </Button>
            )}

            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                Not yet in the tribe?{" "}
                <Text
                  style={[styles.registerLink, { color: colors.primary }]}
                  onPress={() => router.push("/(auth)/register")}
                >
                  Join Now
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
  loginButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  testButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontWeight: "bold",
  },
});