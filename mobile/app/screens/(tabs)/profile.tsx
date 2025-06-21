import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, LayoutAnimation } from 'react-native';
import { ActivityIndicator} from 'react-native-paper';
import { PRIMARY, BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { useTourLMS } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { router } from 'expo-router';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsSection from '../components/profile/StatsSection';
import AchievementsSection from '../components/profile/AchievementsSection';
import AccountSettingsSection from '../components/profile/AccountSettingsSection';
import SupportSection from '../components/profile/SupportSection';
import LogoutButton from '../components/profile/LogoutButton';
import VersionInfo from '../components/profile/VersionInfo';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { user, token, logout, API_URL, updateUserPreferences } = useTourLMS();
  const { toast } = useToast();
  const { isDarkMode, toggleTheme, colors: themeColors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications ?? true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(user?.preferences?.emailNotifications ?? true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(user?.preferences?.smsNotifications ?? false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(user?.preferences?.pushNotifications ?? true);
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
    } catch {
      setNotificationsEnabled(!value);
      toast({
        title: "Update Failed",
        description: "Could not update notification preferences",
        variant: "destructive",
      });
    }
  };

  const handleEmailNotificationToggle = async (value: boolean) => {
    setEmailNotificationsEnabled(value);
    try {
      await updateUserPreferences({ emailNotifications: value });
      toast({
        title: "Email Notifications Updated",
        description: value ? "Email notifications are now enabled" : "Email notifications are now disabled",
      });
    } catch {
      setEmailNotificationsEnabled(!value);
      toast({
        title: "Update Failed",
        description: "Could not update email notification preferences",
        variant: "destructive",
      });
    }
  };

  const handleSmsNotificationToggle = async (value: boolean) => {
    setSmsNotificationsEnabled(value);
    try {
      await updateUserPreferences({ smsNotifications: value });
      toast({
        title: "SMS Notifications Updated",
        description: value ? "SMS notifications are now enabled" : "SMS notifications are now disabled",
      });
    } catch {
      setSmsNotificationsEnabled(!value);
      toast({
        title: "Update Failed",
        description: "Could not update SMS notification preferences",
        variant: "destructive",
      });
    }
  };

  const handlePushNotificationToggle = async (value: boolean) => {
    setPushNotificationsEnabled(value);
    try {
      await updateUserPreferences({ pushNotifications: value });
      toast({
        title: "Push Notifications Updated",
        description: value ? "Push notifications are now enabled" : "Push notifications are now disabled",
      });
    } catch {
      setPushNotificationsEnabled(!value);
      toast({
        title: "Update Failed",
        description: "Could not update push notification preferences",
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
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
      }
    >
      <ProfileHeader
        user={user || {}}
        rank={stats.rank}
        colors={{ PRIMARY, TEXT_PRIMARY: themeColors.text }}
      />
      <StatsSection
        stats={stats}
        colors={{ CARD_BACKGROUND: themeColors.cardBackground, BORDER_COLOR: themeColors.borderColor, TEXT_PRIMARY: themeColors.text, TEXT_SECONDARY: themeColors.textSecondary }}
      />
      <AchievementsSection
        expanded={expandedSections.achievements}
        onToggle={() => toggleSection('achievements')}
        stats={{ certificates: stats.certificates, achievements: stats.achievements }}
        colors={{ CARD_BACKGROUND: themeColors.cardBackground, BORDER_COLOR: themeColors.borderColor, TEXT_PRIMARY: themeColors.text, TEXT_SECONDARY: themeColors.textSecondary }}
      />
      <AccountSettingsSection
        expanded={expandedSections.account}
        onToggle={() => toggleSection('account')}
        showEditProfile={showEditProfile}
        setShowEditProfile={setShowEditProfile}
        showChangePassword={showChangePassword}
        setShowChangePassword={setShowChangePassword}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        onSaveProfile={async () => {
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
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully',
              });
              setShowEditProfile(false);
            } else {
              throw new Error('Failed to update profile');
            }
          } catch (error) {
            console.error('Error updating profile:', error);
            toast({
              title: 'Update Failed',
              description: 'Could not update profile. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        onChangePassword={async () => {
          if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
              title: 'Error',
              description: 'New passwords do not match',
              variant: 'destructive',
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
                title: 'Password Updated',
                description: 'Your password has been changed successfully',
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
              title: 'Update Failed',
              description: 'Could not update password. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        notificationsEnabled={notificationsEnabled}
        onNotificationToggle={handleNotificationToggle}
        emailNotificationsEnabled={emailNotificationsEnabled}
        onEmailNotificationToggle={handleEmailNotificationToggle}
        smsNotificationsEnabled={smsNotificationsEnabled}
        onSmsNotificationToggle={handleSmsNotificationToggle}
        pushNotificationsEnabled={pushNotificationsEnabled}
        onPushNotificationToggle={handlePushNotificationToggle}
        darkModeEnabled={isDarkMode}
        onDarkModeToggle={toggleTheme}
        colors={{ PRIMARY, CARD_BACKGROUND: themeColors.cardBackground, BORDER_COLOR: themeColors.borderColor, TEXT_PRIMARY: themeColors.text, TEXT_SECONDARY: themeColors.textSecondary }}
      />
      <SupportSection
        expanded={expandedSections.support}
        onToggle={() => toggleSection('support')}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        showContact={showContact}
        setShowContact={setShowContact}
        showPrivacy={showPrivacy}
        setShowPrivacy={setShowPrivacy}
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        showApiDocs={showApiDocs}
        setShowApiDocs={setShowApiDocs}
        contactData={contactData}
        setContactData={setContactData}
        onSendContact={async () => {
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
                title: 'Message Sent',
                description: 'Our team will get back to you soon',
              });
              setShowContact(false);
              setContactData({ subject: '', message: '' });
            } else {
              throw new Error('Failed to send message');
            }
          } catch (error) {
            console.error('Error sending message:', error);
            toast({
              title: 'Send Failed',
              description: 'Could not send message. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        colors={{ PRIMARY, CARD_BACKGROUND: themeColors.cardBackground, BORDER_COLOR: themeColors.borderColor, TEXT_PRIMARY: themeColors.text, TEXT_SECONDARY: themeColors.textSecondary }}
      />
      <LogoutButton
        onLogout={handleLogout}
        colors={{ BORDER_COLOR: themeColors.borderColor, TEXT_PRIMARY: themeColors.text }}
      />
      <VersionInfo version="v1.0.0" color={themeColors.textSecondary} />
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