import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Switch, Text, TouchableRipple } from "react-native-paper";
import AIAssistant from "../../components/AIAssistant";

// Color Constants
const PRIMARY = "#FFBF00";
const PRIMARY_LIGHT = "rgba(255, 191, 0, 0.1)";
const TEXT_INACTIVE = "#6B7280"; // Changed to a darker, more visible gray
const BORDER = "rgba(255, 191, 0, 0.2)";
const SHADOW = "#000000";
const BACKGROUND = "#111827";

type NavItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: string;
  inactiveColor: string;
  activeColor: string;
};

const navItems: NavItem[] = [
  {
    icon: "home",
    label: "Home",
    route: "/screens/(tabs)/student",
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: "book",
    label: "Courses",
    route: "/screens/(tabs)/courses",
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: "forum",
    label: "Forum",
    route: "/screens/(tabs)/forum",
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: "trophy",
    label: "Leaderboard",
    route: "/screens/(tabs)/leaderboard",
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: "account",
    label: "Profile",
    route: "/screens/(tabs)/profile",
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
];

// Add/adjust extraNavItems to include all navigable pages in (tabs): Events, Badges, Analytics, Challenges, CourseDetail, apiDocs, and any content page if present
const extraNavItems = [
  { icon: "calendar", label: "Events", route: "/screens/(tabs)/events" },
  { icon: "star", label: "Badges", route: "/screens/(tabs)/badges" },
  { icon: "chart-bar", label: "Analytics", route: "/screens/(tabs)/Analytics" },
  {
    icon: "flag-checkered",
    label: "Challenges",
    route: "/screens/(tabs)/challenges",
  },
  {
    icon: "file-document",
    label: "Course Detail",
    route: "/screens/(tabs)/CourseDetail",
  },
  { icon: "api", label: "API Docs", route: "/screens/(tabs)/apiDocs" },
  // Add content page if it exists
  { icon: "file", label: "Content", route: "/screens/(tabs)/Content" },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.7;

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [darkMode, setDarkMode] = useState(false);

  // PanResponder for swipe-to-open
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger if swiping from the very left edge
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

  const isActive = (route: string) => pathname === route;

  return (
    <View
      style={[styles.container, { backgroundColor: BACKGROUND }]}
      {...panResponder.panHandlers}
    >
      {/* Hamburger menu icon */}
      <TouchableRipple style={styles.hamburger} onPress={openSidebar}>
        <MaterialCommunityIcons name="menu" size={28} color={PRIMARY} />
      </TouchableRipple>

      {/* Glassmorphic Sidebar */}
      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.sidebarOverlay}>
            <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}>
              <BlurView
                intensity={60}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.sidebarContent}
                showsVerticalScrollIndicator={false}
              >
                {/* User Info */}
                <View style={styles.sidebarUserInfo}>
                  <View style={styles.sidebarAvatar}>
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={48}
                      color={PRIMARY}
                    />
                  </View>
                  <Text style={styles.sidebarUserName}>Demo User</Text>
                  <Text style={styles.sidebarUserEmail}>demo@email.com</Text>
                </View>
                <Text style={styles.sidebarTitle}>Menu</Text>
                {/* Main nav items */}
                {navItems.map((item) => (
                  <TouchableRipple
                    key={item.label}
                    style={styles.sidebarNavItem}
                    onPress={() => {
                      closeSidebar();
                      router.push(item.route as any);
                    }}
                  >
                    <View style={styles.sidebarNavItemInner}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={22}
                        color={
                          isActive(item.route)
                            ? item.activeColor
                            : TEXT_INACTIVE
                        }
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        style={{
                          color: isActive(item.route)
                            ? item.activeColor
                            : TEXT_INACTIVE,
                          fontWeight: isActive(item.route) ? "bold" : "normal",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
                {/* Divider */}
                <View style={styles.sidebarDivider} />
                {/* Extra nav items */}
                {extraNavItems.map((item) => (
                  <TouchableRipple
                    key={item.label}
                    style={styles.sidebarNavItem}
                    onPress={() => {
                      closeSidebar();
                      router.push(item.route as any);
                    }}
                  >
                    <View style={styles.sidebarNavItemInner}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={22}
                        color={TEXT_INACTIVE}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ color: TEXT_INACTIVE }}>{item.label}</Text>
                    </View>
                  </TouchableRipple>
                ))}
                {/* Settings shortcut */}
                <TouchableRipple
                  style={styles.sidebarNavItem}
                  onPress={() => {
                    closeSidebar();
                    router.push("/screens/Settings");
                  }}
                >
                  <View style={styles.sidebarNavItemInner}>
                    <MaterialCommunityIcons
                      name="cog"
                      size={22}
                      color={PRIMARY}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={{ color: PRIMARY, fontWeight: "bold" }}>
                      Settings
                    </Text>
                  </View>
                </TouchableRipple>
                {/* Spacer */}
                <View style={{ height: 32 }} />
                {/* Dark mode toggle */}
                <View style={styles.sidebarFooter}>
                  <MaterialCommunityIcons
                    name={darkMode ? "weather-night" : "white-balance-sunny"}
                    size={22}
                    color={PRIMARY}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: PRIMARY, marginRight: 8 }}>
                    Dark Mode
                  </Text>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    color={PRIMARY}
                  />
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

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
      <View style={[styles.bottomNav, { backgroundColor: BACKGROUND }]}>
        <View style={styles.navItemsContainer}>
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <TouchableRipple
                key={item.label}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <View
                  style={[
                    styles.navItemInner,
                    active && styles.activeNavItemInner,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color={active ? item.activeColor : item.inactiveColor}
                  />
                  {active && (
                    <Text
                      style={[styles.navItemText, { color: item.activeColor }]}
                    >
                      {" "}
                      {item.label}{" "}
                    </Text>
                  )}
                </View>
              </TouchableRipple>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: BORDER,
  },
  hamburger: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: PRIMARY,
  },
  sidebarNavItem: {
    marginBottom: 18,
    borderRadius: 8,
    overflow: "hidden",
  },
  sidebarNavItemInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    paddingVertical: 12,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  navItemsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navItemInner: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    paddingTop: 4,
  },
  activeNavItemInner: {
    flexDirection: "column",
    backgroundColor: PRIMARY_LIGHT,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingTop: 4,
  },
  navItemText: {
    fontSize: 9,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 0,
  },
  sidebarUserInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  sidebarAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sidebarUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 4,
  },
  sidebarUserEmail: {
    fontSize: 14,
    color: TEXT_INACTIVE,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 24,
  },
  sidebarFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
});
