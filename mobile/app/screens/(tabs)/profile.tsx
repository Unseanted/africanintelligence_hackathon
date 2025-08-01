
import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AccountSettingsSection from "../../../components/profile/AccountSettingsSection";
import AchievementsSection from "../../../components/profile/AchievementsSection";
import LogoutButton from "../../../components/profile/LogoutButton";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import StatsSection from "../../../components/profile/StatsSection";
import SupportSection from "../../../components/profile/SupportSection";
import VersionInfo from "../../../components/profile/VersionInfo"
import { useTheme } from "../../../app/contexts/ThemeContext";
import { useTourLMS } from "../../../app/contexts/TourLMSContext";
import { useToast } from "../../../hooks/use-toast";

interface UserStats {
  coursesCompleted: number;
  totalXP: number;
  currentStreak: number;
  certificates: number;
  achievements: number;
  rank: string;
}

interface ExpandedSections {
  account: boolean;
  support: boolean;
  achievements: boolean;
}

// Fix 1: Make phone required in the editing user type
interface EditingUser {
  name: string;
  email: string;
  avatar: string;
  phone: string; // Required, not optional
}

const HARDCODED_STATS: UserStats = {
  coursesCompleted: 2,
  totalXP: 1200,
  currentStreak: 5,
  certificates: 1,
  achievements: 1,
  rank: "Novice",
};

// Export the component at the top using a named function declaration
export default function Profile() {
  const { user, logout, updateUserPreferences } = useTourLMS();
  const { toast } = useToast();
  const { isDarkMode, toggleTheme, colors: themeColors } = useTheme();
  
  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notifications ?? true
  );
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  
  // UI states
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    account: false,
    support: false,
    achievements: false,
  });
  const [stats, setStats] = useState<UserStats>(HARDCODED_STATS);
  
  // Profile editing states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Fix 2: Initialize with required phone field
  const [editingUser, setEditingUser] = useState<EditingUser>({
    name: user?.name || "Akin Zulu",
    email: user?.email || "akin.zulu@africanintelligence.com",
    avatar: user?.avatar || "https://via.placeholder.com/100x100?text=AZ",
    phone: "", // Initialize as empty string, not undefined
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const noop = () => {};

  const onRefresh = async () => {
    setRefreshing(true);
    setStats(HARDCODED_STATS);
    setRefreshing(false);
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await updateUserPreferences({ notifications: value });
      toast({
        title: "Notifications Updated",
        description: value
          ? "Notifications are now enabled"
          : "Notifications are now disabled",
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

  const handleEmailToggle = async (value: boolean) => {
    setEmailNotificationsEnabled(value);
    try {
      // Add your email notification toggle logic here
      toast({
        title: "Email Notifications Updated",
        description: value
          ? "Email notifications are now enabled"
          : "Email notifications are now disabled",
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

  const handleSmsToggle = async (value: boolean) => {
    setSmsNotificationsEnabled(value);
    try {
      // Add your SMS notification toggle logic here
      toast({
        title: "SMS Notifications Updated",
        description: value
          ? "SMS notifications are now enabled"
          : "SMS notifications are now disabled",
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

  const handlePushToggle = async (value: boolean) => {
    setPushNotificationsEnabled(value);
    try {
      // Add your push notification toggle logic here
      toast({
        title: "Push Notifications Updated",
        description: value
          ? "Push notifications are now enabled"
          : "Push notifications are now disabled",
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

  const onSaveProfile = async () => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingUser.email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }

      // Validate phone if provided
      if (editingUser.phone) {
        const phoneRegex = /^\+\d{10,15}$/;
        if (!phoneRegex.test(editingUser.phone)) {
          Alert.alert("Invalid Phone", "Please enter a valid phone number (e.g., +1234567890).");
          return;
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context if you have an update function
      // await updateUser(editingUser);
      
      setShowEditProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onChangePassword = async () => {
    try {
      // Validate password fields
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        Alert.alert("Missing Information", "Please fill in all password fields.");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Alert.alert("Password Mismatch", "New password and confirmation do not match.");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        Alert.alert("Weak Password", "Password must be at least 8 characters long.");
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setShowChangePassword(false);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Update Failed",
        description: "Could not change your password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
      toast({
        title: "Farewell, Warrior",
        description:
          "You've left the tribe. Return when you're ready to continue your journey.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Could not leave the tribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fix 3: Create a properly typed user object for ProfileHeader
  const profileUser = {
    id: user?.id || "u1",
    _id: user?._id || "u1", 
    name: user?.name || "Akin Zulu",
    email: user?.email || "akin.zulu@africanintelligence.com",
    role: user?.role || "student" as const,
    avatar: user?.avatar || "https://via.placeholder.com/100x100?text=AZ",
    preferences: {
      notifications: user?.preferences?.notifications ?? true,
      darkMode: user?.preferences?.darkMode ?? false,
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[themeColors.primary]}
        />
      }
    >
      <ProfileHeader
        user={profileUser}
        rank={stats.rank}
      />

      <StatsSection stats={stats} />

      <AchievementsSection
        expanded={expandedSections.achievements}
        onToggle={() => toggleSection("achievements")}
        stats={{
          certificates: stats.certificates,
          achievements: stats.achievements,
        }}
      />

      <AccountSettingsSection
        expanded={expandedSections.account}
        onToggle={() => toggleSection("account")}
        showEditProfile={showEditProfile}
        setShowEditProfile={setShowEditProfile}
        showChangePassword={showChangePassword}
        setShowChangePassword={setShowChangePassword}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        onSaveProfile={onSaveProfile}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        onChangePassword={onChangePassword}
        notificationsEnabled={notificationsEnabled}
        onNotificationToggle={handleNotificationToggle}
        emailNotificationsEnabled={emailNotificationsEnabled}
        onEmailNotificationToggle={handleEmailToggle}
        smsNotificationsEnabled={smsNotificationsEnabled}
        onSmsNotificationToggle={handleSmsToggle}
        pushNotificationsEnabled={pushNotificationsEnabled}
        onPushNotificationToggle={handlePushToggle}
        darkModeEnabled={isDarkMode}
        onDarkModeToggle={toggleTheme}
      />

      <SupportSection
        expanded={expandedSections.support}
        onToggle={() => toggleSection("support")}
        showHelp={false}
        setShowHelp={noop}
        showContact={false}
        setShowContact={noop}
        showPrivacy={false}
        setShowPrivacy={noop}
        showTerms={false}
        setShowTerms={noop}
        showApiDocs={false}
        setShowApiDocs={noop}
        contactData={{ subject: "", message: "" }}
        setContactData={noop}
        onSendContact={async () => {
          toast({
            title: "Contact Support Disabled",
            description: "Contact support is not supported in demo mode",
            variant: "destructive",
          });
        }}
      />

      <LogoutButton
        onLogout={handleLogout}
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
    justifyContent: "center",
    alignItems: "center",
  },
});