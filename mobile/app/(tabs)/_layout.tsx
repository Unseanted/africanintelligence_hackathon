import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { AIAssistant } from '../components/AIAssistant';

type NavItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: string;
  inactiveColor: string;
  activeColor: string;
};

// Define colors for consistency with project's UI
const INACTIVE_COLOR = '#9ca3af'; // Gray from ThemedText subtitle
const ACTIVE_COLOR = '#FFBF00'; // Amber for active color
const ACTIVE_BACKGROUND_COLOR = 'rgba(255, 191, 0, 0.1)'; // Light amber transparent

const navItems: NavItem[] = [
  { icon: 'view-dashboard', label: 'Dashboard', route: '/student', inactiveColor: INACTIVE_COLOR, activeColor: ACTIVE_COLOR },
  { icon: 'forum', label: 'Forum', route: '/(tabs)/forum', inactiveColor: INACTIVE_COLOR, activeColor: ACTIVE_COLOR },
  { icon: 'trophy', label: 'Leaderboard', route: '/(tabs)/leaderboard', inactiveColor: INACTIVE_COLOR, activeColor: ACTIVE_COLOR },
  { icon: 'calendar-star', label: 'Events', route: '/(tabs)/events', inactiveColor: INACTIVE_COLOR, activeColor: ACTIVE_COLOR },
  { icon: 'flag-checkered', label: 'Challenges', route: '/(tabs)/challenges', inactiveColor: INACTIVE_COLOR, activeColor: ACTIVE_COLOR },
];

export default function StudentLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    const cleanPathname = pathname.replace(/\/$/, '');
    let cleanRoute = route.replace(/\/$/, '');
    
    // Handle the special case for the dashboard route
    if (cleanRoute === '/student') {
      return cleanPathname === '/student';
    }

    // For (tabs) routes, usePathname usually returns the path without the (tabs) segment
    if (cleanRoute.startsWith('/(tabs)/')) {
      cleanRoute = cleanRoute.replace('/(tabs)', '');
    }

    return cleanPathname.startsWith(cleanRoute);
  };

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#111827' },
        }}
      />
      
      <AIAssistant />
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <View style={styles.navItemsContainer}>
          {navItems.map((item) => {
            const active = isActive(item.route);

            return (
              <TouchableRipple
                key={item.label}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[
                  styles.navItemInner,
                  active && styles.activeNavItemInner
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color={active ? item.activeColor : item.inactiveColor}
                  />
                  {active && (
                    <ThemedText style={[styles.navItemText, { color: item.activeColor }]}>
                      {item.label}
                    </ThemedText>
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
    backgroundColor: '#111827',
    borderColor :'rgba(255, 191, 0, 0.2)',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: ACTIVE_COLOR,
  },
  navItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemInner: {
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    paddingTop: 4,
  },
  activeNavItemInner: {
    flexDirection: 'column',
    backgroundColor: ACTIVE_BACKGROUND_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    borderWidth: 1,
    borderColor: ACTIVE_COLOR,
    paddingTop: 4,
  },
  navItemText: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 0,
  },
});
