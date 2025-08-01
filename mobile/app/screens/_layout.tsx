import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View
} from "react-native";
import { TouchableRipple } from "react-native-paper";
import AIAssistant from "../../components/AIAssistant";
import BottomNavBar from "../../components/BottomNavBar"; // Import the new component
import Sidebar from '../../components/Sidebar';
import { useTheme } from "../contexts/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.7;

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx > 20 && gestureState.moveX < 30 && !sidebarOpen;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx < SIDEBAR_WIDTH) {
          sidebarAnim.setValue(gestureState.dx - SIDEBAR_WIDTH);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SIDEBAR_WIDTH / 3) {
          openSidebar();
        } else {
          closeSidebar();
        }
      },
    })
  ).current;

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setSidebarOpen(false));
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
      {/* Hamburger menu icon */}
      <TouchableRipple style={styles.hamburger} onPress={openSidebar}>
        <MaterialCommunityIcons name="menu" size={24} color={colors.primary} />
      </TouchableRipple>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarAnim={sidebarAnim}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        colors={colors}
        closeSidebar={closeSidebar}
        router={router}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="student" />
        <Tabs.Screen name="courses" />
        <Tabs.Screen name="forum" />
        <Tabs.Screen name="leaderboard" />
        <Tabs.Screen name="profile" />

      </Tabs>

      <AIAssistant />

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80, 
  },
  hamburger: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 100,
    backgroundColor: "#FFFFFFB3",
    borderRadius: 20,
    padding: 12,
    elevation: 4,
  },
});