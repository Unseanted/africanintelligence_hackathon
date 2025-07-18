import { router } from "expo-router";
import React, { useState, useCallback } from "react";
import { Image, ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Text, TextInput, HelperText } from "react-native-paper";
import { useTheme } from "../../../contexts/ThemeContext";
import { useToast } from "../../../hooks/use-toast";
import { useTourLMS } from "../../../contexts/TourLMSContext";

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

const validateForm = (formData: ForgotPasswordFormData): FormErrors => {
  const errors: FormErrors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  return errors;
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
  const { forgotPassword } = useTourLMS();
  const { toast } = useToast();

  // Handlers
  const handleInputChange = useCallback((field: keyof ForgotPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate form
      const formErrors = validateForm(formData);
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }

      setIsLoading(true);
      
      // Attempt password reset
      await forgotPassword(formData.email.trim());
      
      // Success state
      setIsEmailSent(true);
      
      // Success toast
      toast({
        title: "Reset Link Sent!",
        description: "Check your email for password reset instructions.",
      });
      
    } catch (error) {
      console.error("Forgot password error:", error);
      
      // Handle different error types
      let errorMessage = "Unable to send reset email. Please try again.";
      
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
  }, [formData, forgotPassword, toast]);

  const handleBackToLogin = useCallback(() => {
    router.push("/(auth)/login");
  }, []);

  const handleResendEmail = useCallback(() => {
    setIsEmailSent(false);
    setErrors({});
    handleSubmit();
  }, [handleSubmit]);

  // Check if form is valid
  const isFormValid = !validateEmail(formData.email);

  // Success screen after email is sent
  if (isEmailSent) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={[styles.formContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              {/* Header Section */}
              <View style={styles.header}>
                <View style={[styles.logoContainer, { backgroundColor: colors.primary + "20" }]}>
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

              {/* Actions */}
              <View style={styles.form}>
                <Button
                  mode="contained"
                  onPress={handleResendEmail}
                  loading={isLoading}
                  disabled={isLoading}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                >
                  Resend Email
                </Button>

                <Button
                  mode="text"
                  onPress={handleBackToLogin}
                  disabled={isLoading}
                  style={styles.textButton}
                  labelStyle={{ color: colors.primary }}
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
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={[styles.formContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary + "20" }]}>
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
                Enter your email address and we'll send you instructions to reset your password
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
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
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
                  theme={{ colors: { primary: colors.primary, outline: colors.borderColor } }}
                  disabled={isLoading}
                  placeholder="you@africanintelligence.com"
                  error={!!errors.email}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              </View>

              {/* Reset Button */}
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
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>

              {/* Back to Login Link */}
              <View style={styles.linkContainer}>
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  Remember your password?{" "}
                  <Text
                    style={[styles.link, { color: colors.primary }]}
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
    borderRadius: 8,
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
  textButton: {
    marginTop: 8,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});