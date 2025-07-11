import { View, StyleSheet } from 'react-native';
import { TouchableRipple, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname, Tabs } from 'expo-router';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
// Color Constants
const PRIMARY = '#FFBF00';
const PRIMARY_LIGHT = 'rgba(255, 191, 0, 0.1)';
const TEXT_INACTIVE = '#9CA3AF';
const BORDER = 'rgba(255, 191, 0, 0.2)';
const SHADOW = '#000000';
const BACKGROUND = '#111827';

type NavItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: string;
  inactiveColor: string;
  activeColor: string;
};

const navItems: NavItem[] = [
  {
    icon: 'home',
    label: 'Home',
    route: '/screens/(tabs)/student',
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: 'book',
    label: 'Courses',
    route: '/screens/(tabs)/courses',
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: 'forum',
    label: 'Forum',
    route: '/screens/(tabs)/forum',
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: 'trophy',
    label: 'Leaderboard',
    route: '/screens/(tabs)/leaderboard',
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
  {
    icon: 'account',
    label: 'Profile',
    route: '/screens/(tabs)/profile',
    inactiveColor: TEXT_INACTIVE,
    activeColor: PRIMARY,
  },
];

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="student" />
        <Tabs.Screen name="courses" />
        <Tabs.Screen name="forum" />
        <Tabs.Screen name="leaderboard" />
        <Tabs.Screen name="profile" />
      </Tabs>
      
      <AIAssistant />

      <Sidebar />
      
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
                    <Text style={[styles.navItemText, { color: item.activeColor }]}>
                      {item.label}
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  },
});
