import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, LayoutAnimation, Linking } from 'react-native';
import { Text, Card, Button, Avatar, List, Switch, ActivityIndicator, Divider, TextInput } from 'react-native-paper';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { API_URL } from '../../../constants/api';
import { useTourLMS } from '../../../contexts/TourLMSContext';
import { useToast } from '../../hooks/use-toast';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';

export default function Profile() {
  const { user, token, logout, updateUserPreferences } = useTourLMS();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications ?? true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(user?.preferences?.darkMode ?? false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    account: false,
    support: false,
    achievements: false
  });
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    totalXP: 0,
    currentStreak: 0,
    certificates: 0,
    achievements: 0,
    rank: 'Novice'
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [editingUser, setEditingUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [contactData, setContactData] = useState({
    subject: '',
    message: ''
  });

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user stats. Please try again.",
        variant: "destructive",
      });
    }
  }, [API_URL, token, toast]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserStats();
    setRefreshing(false);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await updateUserPreferences({ notifications: value });
      toast({
        title: "Notifications Updated",
        description: value ? "Notifications are now enabled" : "Notifications are now disabled",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setNotificationsEnabled(!value);
      toast({
        title: "Update Failed",
        description: "Could not update notification preferences",
        variant: "destructive",
      });
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkModeEnabled(value);
    try {
      await updateUserPreferences({ darkMode: value });
      toast({
        title: "Theme Updated",
        description: value ? "Dark mode enabled" : "Light mode enabled",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setDarkModeEnabled(!value);
      toast({
        title: "Update Failed",
        description: "Could not update theme preferences",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserStats();
    setLoading(false);
  }, [fetchUserStats]);

  useEffect(() => {
    if (user) {
      setEditingUser({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
      toast({
        title: "Farewell, Warrior",
        description: "You've left the tribe. Return when you're ready to continue your journey.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Could not leave the tribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: BACKGROUND }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={[styles.container, { backgroundColor: BACKGROUND }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
        }
      >
        <View style={styles.header}>
          <Avatar.Image 
            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }} 
            size={100} 
            style={styles.avatar} 
          />
          <ThemedText type="title" style={styles.name}>{user?.name || 'User'}</ThemedText>
          <ThemedText style={styles.email}>{user?.email || 'No email'}</ThemedText>
          <View style={styles.rankBadge}>
            <Text style={[styles.rank, { color: TEXT_PRIMARY }]}>{stats.rank}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
            <Card.Content>
              <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{stats.coursesCompleted}</Text>
              <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Courses</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
            <Card.Content>
              <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{stats.totalXP}</Text>
              <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Total XP</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
            <Card.Content>
              <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{stats.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Day Streak</Text>
            </Card.Content>
          </Card>
        </View>

        <TouchableOpacity onPress={() => toggleSection('achievements')}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Achievements</Text>
            <Icon 
              name={expandedSections.achievements ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={TEXT_PRIMARY} 
            />
          </View>
        </TouchableOpacity>

        {expandedSections.achievements && (
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
              <Card.Content>
                <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{stats.certificates}</Text>
                <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Certificates</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
              <Card.Content>
                <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{stats.achievements}</Text>
                <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Badges</Text>
              </Card.Content>
            </Card>
          </View>
        )}

        <TouchableOpacity onPress={() => toggleSection('account')}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Account Settings</Text>
            <Icon 
              name={expandedSections.account ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={TEXT_PRIMARY} 
            />
          </View>
        </TouchableOpacity>

        {expandedSections.account && (
          <Card style={[styles.settingsCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
            <Card.Content>
              <List.Item
                title="Edit Profile"
                left={props => <List.Icon {...props} icon="account-edit" />}
                onPress={() => setShowEditProfile(true)}
              />
              <Divider />
              <List.Item
                title="Change Password"
                left={props => <List.Icon {...props} icon="lock" />}
                onPress={() => setShowChangePassword(true)}
              />
              <Divider />
              <List.Item
                title="Notifications"
                left={props => <List.Icon {...props} icon="bell" />}
                right={props => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationToggle}
                  />
                )}
              />
              <Divider />
              <List.Item
                title="Dark Mode"
                left={props => <List.Icon {...props} icon="theme-light-dark" />}
                right={props => (
                  <Switch
                    value={darkModeEnabled}
                    onValueChange={handleDarkModeToggle}
                  />
                )}
              />
            </Card.Content>
          </Card>
        )}

        <TouchableOpacity onPress={() => toggleSection('support')}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Support</Text>
            <Icon 
              name={expandedSections.support ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={TEXT_PRIMARY} 
            />
          </View>
        </TouchableOpacity>

        {expandedSections.support && (
          <Card style={[styles.settingsCard, { backgroundColor: CARD_BACKGROUND, borderColor: BORDER_COLOR }]}>
            <Card.Content>
              <List.Item
                title="Help Center"
                left={props => <List.Icon {...props} icon="help-circle" />}
                onPress={() => setShowHelp(true)}
              />
              <Divider />
              <List.Item
                title="Contact Support"
                left={props => <List.Icon {...props} icon="email" />}
                onPress={() => setShowContact(true)}
              />
              <Divider />
              <List.Item
                title="Privacy Policy"
                left={props => <List.Icon {...props} icon="shield-account" />}
                onPress={() => setShowPrivacy(true)}
              />
              <Divider />
              <List.Item
                title="Terms of Service"
                left={props => <List.Icon {...props} icon="file-document" />}
                onPress={() => setShowTerms(true)}
              />
              <Divider />
              <List.Item
                title="API Documentation"
                left={props => <List.Icon {...props} icon="api" />}
                onPress={() => setShowApiDocs(true)}
              />
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={PRIMARY}
        >
          Logout
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    marginBottom: 10,
    borderWidth: 3,
    borderColor: CARD_BACKGROUND,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    opacity: 0.7,
  },
  rankBadge: {
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  statCard: {
    flex: 1,
    margin: 5,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: CARD_BACKGROUND,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsCard: {
    margin: 15,
    borderWidth: 1,
  },
  logoutButton: {
    margin: 15,
    borderColor: PRIMARY,
  },
});