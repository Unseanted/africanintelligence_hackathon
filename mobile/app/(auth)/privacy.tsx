import { router } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useTheme } from "../contexts/ThemeContext";

export default function PrivacyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text 
        variant="headlineMedium" 
        style={[styles.title, { color: colors.text }]}
      >
        Sacred Data Pact
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Data Collection
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        We gather only what's essential: your identity, contact details, 
        and learning progress to enhance your tribal journey.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Data Protection
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Your information is shielded with warrior-grade encryption, 
        accessible only to trusted elders of the tribe.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Your Rights
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        You may request to view, correct, or erase your data at any time 
        through the chieftain's council (support@africanintelligence.com).
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Third Parties
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        We never trade or sell your data. Selected partners may assist in 
        delivering our services under strict tribal agreements.
      </Text>

      <Button
        mode="contained"
        onPress={() => router.back()}
        style={[styles.button, { backgroundColor: colors.primary }]}
        labelStyle={{ color: colors.onPrimary }}
      >
        I Acknowledge
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 18,
  },
  text: {
    marginBottom: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 30,
    paddingVertical: 8,
  },
});