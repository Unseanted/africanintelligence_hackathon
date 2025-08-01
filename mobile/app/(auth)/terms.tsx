import { ScrollView, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useTheme } from "../contexts/ThemeContext";
import { router } from "expo-router";

export default function TermsScreen() {
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
        Tribal Code of Conduct
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        1. Respect for All Members
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Every member of African Intelligence shall treat others with dignity and respect, 
        honoring the diverse backgrounds and perspectives within our community.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        2. Knowledge Sharing
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Members shall actively participate in the exchange of wisdom, ensuring 
        information is shared accurately and credited to its original sources.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        3. Confidentiality
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Tribal discussions and shared materials shall remain within the community 
        unless explicit permission is granted for external sharing.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        4. Growth Mindset
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Members commit to continuous learning and constructive feedback, 
        fostering an environment where all can ascend together.
      </Text>

      <Button
        mode="contained"
        onPress={() => router.back()}
        style={[styles.button, { backgroundColor: colors.primary }]}
        labelStyle={{ color: colors.onPrimary }}
      >
        I Understand
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