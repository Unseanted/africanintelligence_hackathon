import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTourLMS } from "./contexts/TourLMSContext";

export default function LandingPage() {
  const router = useRouter();
  const { user, token, loading } = useTourLMS();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (loading || hasNavigated.current) return;

    const timeout = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        try {
          if (user && token) {
            router.replace("/screens/(tabs)/student");
          } else {
            router.replace("/(auth)/login");
          }
        } catch (error) {
          console.warn("Navigation error:", error);
          hasNavigated.current = false;
        }
      }
    }, user && token ? 100 : 3000); // Shorter delay for authenticated users

    return () => clearTimeout(timeout);
  }, [router, user, token, loading]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/home.png")}
        style={styles.logo}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <Text style={styles.welcomeText}>
        Welcome to African Intelligence
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#000000",
  },
});