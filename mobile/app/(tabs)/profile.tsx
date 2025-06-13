import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, LayoutAnimation, Linking } from 'react-native';
import { Text, Card, Button, Avatar, List, Switch, ActivityIndicator, Divider, TextInput } from 'react-native-paper';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { useTourLMS } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Profile() {
  const { user, token, logout, API_URL, updateUserPreferences } = useTourLMS();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications ?? true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(user?.preferences?.darkMode ?? false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    account: boolean;
    support: boolean;
    achievements: boolean;
  }>({
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
    <ScrollView 
      style={[styles.container, { backgroundColor: BACKGROUND }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
      }
    >
      <View style={[styles.header, { backgroundColor: PRIMARY }]}>
        <Avatar.Image 
          source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }} 
          size={100} 
          style={styles.avatar} 
        />
        <Text style={[styles.name, { color: TEXT_PRIMARY }]}>{user?.name}</Text>
        <Text style={[styles.role, { color: TEXT_PRIMARY }]}>{user?.role}</Text>
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
              description="Update your personal information"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="account-edit" color={PRIMARY} />}
              onPress={() => setShowEditProfile(prev => !prev)}
            />
            {showEditProfile && (
              <View style={{ padding: 16 }}>
                <TextInput
                  label="Name"
                  value={editingUser.name}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) => setEditingUser(prev => ({ ...prev, name: text }))}
                />
                <TextInput
                  label="Email"
                  value={editingUser.email}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  keyboardType="email-address"
                  onChangeText={(text) => setEditingUser(prev => ({ ...prev, email: text }))}
                />
                <TextInput
                  label="Avatar URL"
                  value={editingUser.avatar}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  placeholder="Enter image URL"
                  onChangeText={(text) => setEditingUser(prev => ({ ...prev, avatar: text }))}
                />
                <Button
                  mode="contained"
                  onPress={async () => {
                    try {
                      const response = await fetch(`${API_URL}/user/profile`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(editingUser)
                      });
                      
                      if (response.ok) {
                        toast({
                          title: "Profile Updated",
                          description: "Your profile has been updated successfully",
                        });
                        setShowEditProfile(false);
                      } else {
                        throw new Error('Failed to update profile');
                      }
                    } catch (error) {
                      console.error('Error updating profile:', error);
                      toast({
                        title: "Update Failed",
                        description: "Could not update profile. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  style={{ marginTop: 8 }}
                >
                  Save Changes
                </Button>
              </View>
            )}
            <Divider style={styles.divider} />
            <List.Item
              title="Change Password"
              description="Update your login credentials"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="lock" color={PRIMARY} />}
              onPress={() => setShowChangePassword(prev => !prev)}
            />
            {showChangePassword && (
              <View style={{ padding: 16 }}>
                <TextInput
                  label="Current Password"
                  value={passwordData.currentPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                />
                <TextInput
                  label="New Password"
                  value={passwordData.newPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                />
                <TextInput
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                />
                <Button
                  mode="contained"
                  onPress={async () => {
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      toast({
                        title: "Error",
                        description: "New passwords do not match",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      const response = await fetch(`${API_URL}/user/change-password`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          currentPassword: passwordData.currentPassword,
                          newPassword: passwordData.newPassword
                        })
                      });
                      
                      if (response.ok) {
                        toast({
                          title: "Password Updated",
                          description: "Your password has been changed successfully",
                        });
                        setShowChangePassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      } else {
                        throw new Error('Failed to update password');
                      }
                    } catch (error) {
                      console.error('Error updating password:', error);
                      toast({
                        title: "Update Failed",
                        description: "Could not update password. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  style={{ marginTop: 8 }}
                >
                  Update Password
                </Button>
              </View>
            )}
            <Divider style={styles.divider} />
            <List.Item
              title="Notifications"
              description="Enable or disable app notifications"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="bell" color={PRIMARY} />}
              right={props => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  color={PRIMARY}
                />
              )}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Dark Mode"
              description="Toggle between light and dark theme"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="theme-light-dark" color={PRIMARY} />}
              right={props => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={handleDarkModeToggle}
                  color={PRIMARY}
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
              description="Find answers to common questions"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="help-circle" color={PRIMARY} />}
              onPress={() => setShowHelp(prev => !prev)}
            />
            {showHelp && (
              <View style={{ padding: 16 }}>
                <Text style={{ color: TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Frequently Asked Questions</Text>
                <List.AccordionGroup>
                  <List.Accordion title="How do I start a course?" id="1">
                    <List.Item
                      description="Browse available courses in the Courses tab and click 'Enroll' to begin your learning journey."
                      descriptionStyle={{ color: TEXT_SECONDARY }}
                    />
                  </List.Accordion>
                  <List.Accordion title="How do I earn XP?" id="2">
                    <List.Item
                      description="Complete lessons, participate in discussions, and complete challenges to earn XP points."
                      descriptionStyle={{ color: TEXT_SECONDARY }}
                    />
                  </List.Accordion>
                  <List.Accordion title="What are achievements?" id="3">
                    <List.Item
                      description="Achievements are badges you earn by completing specific milestones in your learning journey."
                      descriptionStyle={{ color: TEXT_SECONDARY }}
                    />
                  </List.Accordion>
                </List.AccordionGroup>
              </View>
            )}
            <Divider style={styles.divider} />
            <List.Item
              title="Contact Support"
              description="Get in touch with our team"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="message" color={PRIMARY} />}
              onPress={() => setShowContact(prev => !prev)}
            />
            {showContact && (
              <View style={{ padding: 16 }}>
                <Text style={{ color: TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Contact Our Support Team</Text>
                <TextInput
                  label="Subject"
                  value={contactData.subject}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) => setContactData(prev => ({ ...prev, subject: text }))}
                />
                <TextInput
                  label="Message"
                  value={contactData.message}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) => setContactData(prev => ({ ...prev, message: text }))}
                />
                <Button
                  mode="contained"
                  onPress={async () => {
                    try {
                      const response = await fetch(`${API_URL}/support/contact`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(contactData)
                      });
                      
                      if (response.ok) {
                        toast({
                          title: "Message Sent",
                          description: "Our team will get back to you soon",
                        });
                        setShowContact(false);
                        setContactData({ subject: '', message: '' });
                      } else {
                        throw new Error('Failed to send message');
                      }
                    } catch (error) {
                      console.error('Error sending message:', error);
                      toast({
                        title: "Send Failed",
                        description: "Could not send message. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Send Message
                </Button>
              </View>
            )}
            <Divider style={styles.divider} />
            <List.Item
              title="Privacy Policy"
              description="Review our data practices"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="shield-account" color={PRIMARY} />}
              onPress={() => setShowPrivacy(prev => !prev)}
            />
            {showPrivacy && (
              <View style={{ padding: 16 }}>
                <ScrollView style={{ maxHeight: 300 }}>
                  <Text style={{ color: TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Privacy Policy</Text>
                  <Text style={{ color: TEXT_SECONDARY, lineHeight: 20 }}>
                    Last updated: {new Date().toLocaleDateString()}{'\n\n'}
                    We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.{'\n\n'}
                    1. The data we collect about you{'\n'}
                    2. How we use your personal data{'\n'}
                    3. Data security{'\n'}
                    4. Your legal rights{'\n\n'}
                    For more information, please contact our support team.
                  </Text>
                </ScrollView>
              </View>
            )}
            <Divider style={styles.divider} />
            <List.Item
              title="Terms of Service"
              description="Read our terms and conditions"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="file-document" color={PRIMARY} />}
              onPress={() => setShowTerms(prev => !prev)}
            />
            {showTerms && (
              <View style={{ padding: 16 }}>
                <ScrollView style={{ maxHeight: 300 }}>
                  <Text style={{ color: TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Terms of Service</Text>
                  <Text style={{ color: TEXT_SECONDARY, lineHeight: 20 }}>
                    Last updated: {new Date().toLocaleDateString()}{'\n\n'}
                    Please read these terms of service carefully before using our platform.{'\n\n'}
                    1. Acceptance of Terms{'\n'}
                    2. User Accounts{'\n'}
                    3. Intellectual Property{'\n'}
                    4. User Conduct{'\n'}
                    5. Termination{'\n\n'}
                    By using our platform, you agree to these terms.
                  </Text>
                </ScrollView>
              </View>
            )}
            <Divider style={styles.divider} />
            <List.Item
              title="API Docs"
              description="Access our API documentation"
              titleStyle={{ color: TEXT_PRIMARY }}
              descriptionStyle={{ color: TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="file-document" color={PRIMARY} />}
              onPress={() => setShowApiDocs(prev => !prev)}
            />
            {showApiDocs && (
              <View style={{ padding: 16 }}>
                <Text style={{ color: TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>API Documentation</Text>
                <List.AccordionGroup>
                  <List.Accordion title="Authentication" id="api1">
                    <List.Item
                      description="All API requests require authentication using a Bearer token."
                      descriptionStyle={{ color: TEXT_SECONDARY }}
                    />
                  </List.Accordion>
                  <List.Accordion title="Endpoints" id="api2">
                    <List.Item
                      description="Base URL: https://api.tourlms.com/v1"
                      descriptionStyle={{ color: TEXT_SECONDARY }}
                    />
                  </List.Accordion>
                  <List.Accordion title="Rate Limiting" id="api3">
                    <List.Item
                      description="API requests are limited to 100 requests per minute."
                      descriptionStyle={{ color: TEXT_SECONDARY }}
                    />
                  </List.Accordion>
                </List.AccordionGroup>
                <Button
                  mode="outlined"
                  onPress={() => {
                    Linking.openURL('https://api.tourlms.com/docs');
                  }}
                  style={{ marginTop: 16 }}
                >
                  View Full Documentation
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={[styles.logoutButton, { borderColor: BORDER_COLOR }]}
        textColor={TEXT_PRIMARY}
        icon="logout"
      >
        Log Out
      </Button>

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: TEXT_SECONDARY }]}>v1.0.0</Text>
      </View>
    </ScrollView>
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
    paddingTop: 40,
    alignItems: 'center',
    paddingBottom: 30,
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 4,
    backgroundColor: BORDER_COLOR,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 12,
  }
});