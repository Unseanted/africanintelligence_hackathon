import { router } from "expo-router";
import React, { useState, useCallback } from "react";
import { Image, ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Text, TextInput, HelperText } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../hooks/use-toast";

// Types
interface ForgotPasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

// Validation helpers
const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
};

export default function ForgotPassword() {
  // State management
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Hooks
  const { colors } = useTheme();
  const { toast } = useToast();

  // Handlers
  const handleInputChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    
    // Clear field-specific error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate form
      const emailError = validateEmail(formData.email);
      if (emailError) {
        setErrors({ email: emailError });
        return;
      }

      setIsLoading(true);
      
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsEmailSent(true);
      toast({
        title: "Reset Email Sent!",
        description: "Check your email for password reset instructions.",
      });
      
    } catch (error) {
      console.error("Password reset error:", error);
      
      // Handle different error types
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error && typeof error === "object" && "message" in error) {
        const errorMsg = (error as { message?: string }).message;
        if (errorMsg) {
          errorMessage = errorMsg;
        }
      }
      
      // Set general error and show toast
      setErrors({ general: errorMessage });
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast]);

  const handleBackToLogin = useCallback(() => {
    router.back();
  }, []);

  // Check if form is valid
  const isFormValid = !validateEmail(formData.email);

  if (isEmailSent) {
    return (
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={[styles.formContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.header}>
                <View style={[styles.logoContainer, { backgroundColor: colors.primary + "30" }]}>
                  <Image
                    source={require("../../assets/images/logo1.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Check Your Email
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  We've sent password reset instructions to {formData.email}
                </Text>
              </View>

              <View style={styles.form}>
                <Button
                  mode="contained"
                  onPress={handleBackToLogin}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                >
                  Back to Login
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={[styles.formContainer, { backgroundColor: colors.cardBackground }]}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary + "30" }]}>
                <Image
                  source={require("../../assets/images/logo1.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Reset Your Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your email and we'll send you reset instructions
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {/* General Error */}
              {errors.general && (
                <View style={[styles.errorContainer, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
                  <Text style={[styles.errorText, { color: colors.primary }]}>{errors.general}</Text>
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={handleInputChange}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardBackground },
                    errors.email && { borderColor: colors.primary }
                  ]}
                  theme={{ colors: { primary: colors.primary } }}
                  disabled={isLoading}
                  placeholder="you@africanintelligence.com"
                  error={!!errors.email}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              </View>

              {/* Send Reset Email Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading || !isFormValid}
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  (!isFormValid || isLoading) && styles.buttonDisabled
                ]}
                contentStyle={styles.buttonContent}
              >
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>

              {/* Back to Login Link */}
              <View style={styles.backToLoginContainer}>
                <Text style={[styles.backToLoginText, { color: colors.textSecondary }]}>
                  Remember your password?{" "}
                  <Text
                    style={[styles.backToLoginLink, { color: colors.primary }]}
                    onPress={handleBackToLogin}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    padding: 16,
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    gap: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    borderColor: "rgba(234, 179, 8, 0.2)",
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backToLoginContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 16,
    textAlign: "center",
  },
  backToLoginLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});