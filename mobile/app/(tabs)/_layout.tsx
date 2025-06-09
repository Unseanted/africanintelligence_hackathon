import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import AIAssistant from '../components/AIAssistant';

// Color Constants
const PRIMARY = '#FFBF00';
const PRIMARY_LIGHT = 'rgba(255, 191, 0, 0.1)';
const TEXT_INACTIVE = '#9CA3AF';
const BACKGROUND = '#000';
const BORDER = 'rgba(255, 191, 0, 0.2)';
const SHADOW = '#000000';
const TEXT_PRIMARY = '#000000';

type NavItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: string;
  inactiveColor: string;
  activeColor: string;
};

const navItems: NavItem[] = [
  { icon: 'view-dashboard', label: 'Dashboard', route: '/student', inactiveColor: TEXT_INACTIVE, activeColor: PRIMARY },
  { icon: 'forum', label: 'Forum', route: '/(tabs)/forum', inactiveColor: TEXT_INACTIVE, activeColor: PRIMARY },
  { icon: 'trophy', label: 'Leaderboard', route: '/(tabs)/leaderboard', inactiveColor: TEXT_INACTIVE, activeColor: PRIMARY },
  { icon: 'calendar-star', label: 'Events', route: '/(tabs)/events', inactiveColor: TEXT_INACTIVE, activeColor: PRIMARY },
  { icon: 'flag-checkered', label: 'Challenges', route: '/(tabs)/challenges', inactiveColor: TEXT_INACTIVE, activeColor: PRIMARY },
  { icon: 'account', label: 'Profile', route: '/(tabs)/profile', inactiveColor: TEXT_INACTIVE, activeColor: PRIMARY },
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
    backgroundColor: BACKGROUND,
    borderColor: BORDER,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BACKGROUND,
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
    backgroundColor: PRIMARY_LIGHT,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingTop: 4,
  },
  navItemText: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 0,
    color: TEXT_PRIMARY,
  },
});
