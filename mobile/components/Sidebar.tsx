// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import React from "react";
// import { Animated, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
// import { Switch, Text, TouchableRipple } from "react-native-paper";

// interface SidebarProps {
//   sidebarOpen: boolean;
//   sidebarAnim: Animated.Value;
//   isDarkMode: boolean;
//   toggleTheme: () => void;
//   colors: any;
//   closeSidebar: () => void;
//   router: any;
// }

// const SIDEBAR_WIDTH = 0.7 * (typeof window !== 'undefined' ? window.innerWidth : 400); // fallback

// export default function Sidebar({ sidebarOpen,
//   sidebarAnim,
//   isDarkMode,
//   toggleTheme,
//   colors,
//   closeSidebar,
//   router, }: SidebarProps) {

//   if (!sidebarOpen) return null;
//   return (
//     <TouchableWithoutFeedback onPress={closeSidebar}>
//       <View style={styles.sidebarOverlay}>
//         <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}> 
//           <BlurView
//             intensity={60}
//             tint={isDarkMode ? "dark" : "light"}
//             style={StyleSheet.absoluteFill}
//           />
//           <ScrollView
//             style={{ flex: 1 }}
//             contentContainerStyle={styles.sidebarContent}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* User Info */}
//             <View style={styles.sidebarUserInfo}>
//               <View
//                 style={[styles.sidebarAvatar, { backgroundColor: colors.primary + "33" }]}
//               >
//                 <MaterialCommunityIcons
//                   name="account-circle"
//                   size={40}
//                   color={colors.primary}
//                 />
//               </View>
//               <Text style={[styles.sidebarUserName, { color: colors.primary }]}>Guest</Text>
//             </View>


//               {/* Settings shortcut */}
//               <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/student");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="home"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Home
//                 </Text>
//               </View>
//             </TouchableRipple>

//               {/* Settings shortcut */}
//               <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/course");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="book"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Courses
//                 </Text>
//               </View>
//             </TouchableRipple>
//               {/* Settings shortcut */}
//               <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/events");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="calendar"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Events
//                 </Text>
//               </View>
//             </TouchableRipple>
//               {/* Settings shortcut */}
//               <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/achievements");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="star"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Achievements
//                 </Text>
//               </View>
//             </TouchableRipple>

//               {/* Settings shortcut */}
//               <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/challenges");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="flag-checkered"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Challenges
//                 </Text>
//               </View>
//             </TouchableRipple>
//                {/* Settings shortcut */}
//                <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/analytics");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="chart-bar"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Analytics
//                 </Text>
//               </View>
//             </TouchableRipple>
           
//             {/* Settings shortcut */}
//             <TouchableRipple
//               style={styles.sidebarNavItem}
//               onPress={() => {
//                 closeSidebar();
//                 router.push("/screens/(tabs)/profile");
//               }}
//             >
//               <View style={styles.sidebarNavItemInner}>
//                 <MaterialCommunityIcons
//                   name="cog"
//                   size={22}
//                   color={colors.primary}
//                   style={{ marginRight: 12 }}
//                 />
//                 <Text style={{ color: colors.primary, fontWeight: "bold" }}>
//                   Settings
//                 </Text>
//               </View>
//             </TouchableRipple>
//             {/* Spacer */}
//             <View style={{ height: 32 }} />
//             {/* Dark mode toggle */}
//             <View style={styles.sidebarFooter}>
//               <MaterialCommunityIcons
//                 name={isDarkMode ? "weather-night" : "white-balance-sunny"}
//                 size={22}
//                 color={colors.primary}
//                 style={{ marginRight: 8 }}
//               />
//               <Text style={{ color: colors.primary, marginRight: 8 }}>
//                 Dark Mode
//               </Text>
//               <Switch
//                 value={isDarkMode}
//                 onValueChange={toggleTheme}
//                 color={colors.primary}
//               />
//             </View>
//           </ScrollView>
//         </Animated.View>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   sidebarOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 90,
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: SIDEBAR_WIDTH,
//     height: "100%",
//     backgroundColor: "#FFFFFF66",
//     shadowColor: "#000000",
//     shadowOffset: { width: 2, height: 0 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 10,
//     paddingBottom: 40,
//   },
//   sidebarContent: {
//     flex: 1,
//     paddingTop: 80,
//     paddingHorizontal: 24,
//   },
//   sidebarUserInfo: {
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   sidebarAvatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   sidebarUserName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   sidebarNavItem: {
//     marginBottom: 18,
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   sidebarNavItemInner: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//   },
//   sidebarFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 20,
//   },
// });





import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Switch, Text, TouchableRipple } from "react-native-paper";

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarAnim: Animated.Value;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: any;
  closeSidebar: () => void;
  router: any;
}

const getWindowWidth = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return Dimensions.get('window').width;
};

const SIDEBAR_WIDTH = 0.7 * getWindowWidth();

export default function Sidebar({
  sidebarOpen,
  sidebarAnim,
  isDarkMode,
  toggleTheme,
  colors,
  closeSidebar,
  router,
}: SidebarProps) {

  if (!sidebarOpen) return null;
  
  return (
    <TouchableWithoutFeedback onPress={closeSidebar}>
      <View style={styles.sidebarOverlay}>
        <Animated.View style={[styles.sidebar, { 
          left: sidebarAnim,
          backgroundColor: Platform.select({
            web: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            default: 'transparent'
          })
        }]}> 
          {Platform.OS !== 'web' && (
            <BlurView
              intensity={60}
              tint={isDarkMode ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          )}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.sidebarContent}
            showsVerticalScrollIndicator={false}
          >
            {/* User Info */}
            <View style={styles.sidebarUserInfo}>
              <View
                style={[styles.sidebarAvatar, { backgroundColor: colors.primary + "33" }]}
              >
                <MaterialCommunityIcons
                  name="account-circle"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.sidebarUserName, { color: colors.primary }]}>Guest</Text>
            </View>

            {/* Navigation Items */}
            <View style={styles.navItemsContainer}>
              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/student");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="home"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Home
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/course");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="book"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Courses
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/events");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Events
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/achievements");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="star"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Achievements
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/challenges");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="flag-checkered"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Challenges
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/analytics");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="chart-bar"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Analytics
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={[styles.sidebarNavItem, { backgroundColor: colors.primary + "10" }]}
                onPress={() => {
                  closeSidebar();
                  router.push("/screens/(tabs)/profile");
                }}
                borderless={true}
              >
                <View style={styles.sidebarNavItemInner}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                    Settings
                  </Text>
                </View>
              </TouchableRipple>
            </View>

            {/* Spacer */}
            <View style={{ height: 32 }} />
            
            {/* Dark mode toggle */}
            <View style={[styles.sidebarFooter, { backgroundColor: colors.primary + "10", borderRadius: 20 }]}>
              <MaterialCommunityIcons
                name={isDarkMode ? "weather-night" : "white-balance-sunny"}
                size={22}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: colors.primary, marginRight: 8 }}>
                Dark Mode
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={colors.primary}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
    ...Platform.select({
      web: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      },
      default: {}
    })
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: "100%",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: 40,
    ...Platform.select({
      web: {
        transition: 'left 0.3s ease',
      },
      default: {}
    })
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  sidebarUserInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  sidebarAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sidebarUserName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  navItemsContainer: {
    marginBottom: 16,
  },
  sidebarNavItem: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  sidebarNavItemInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sidebarFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});