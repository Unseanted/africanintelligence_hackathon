import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import AccountSettingsSection from "../../components/profile/AccountSettingsSection";
import AchievementsSection from "../../components/profile/AchievementsSection";
import LogoutButton from "../../components/profile/LogoutButton";
import ProfileHeader from "../../components/profile/ProfileHeader";
import StatsSection from "../../components/profile/StatsSection";
import SupportSection from "../../components/profile/SupportSection";
import VersionInfo from "../../components/profile/VersionInfo";
import { useTheme } from "../../context/ThemeContext";
import { useTourLMS } from "../../contexts/TourLMSContext";
import { useToast } from "../../hooks/use-toast";
import { PRIMARY } from "../constants/colors";

// Hardcoded stats
const HARDCODED_STATS = {
  coursesCompleted: 2,
  totalXP: 1200,
  currentStreak: 5,
  certificates: 1,
  achievements: 1,
  rank: "Novice",
};

export default function Profile() {
  const { user, logout, updateUserPreferences } = useTourLMS();
  const { toast } = useToast();
  const { isDarkMode, toggleTheme, colors: themeColors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notifications ?? true
  );
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    account: boolean;
    support: boolean;
    achievements: boolean;
  }>({
    account: false,
    support: false,
    achievements: false,
  });
  const [stats, setStats] = useState(HARDCODED_STATS);

  const onRefresh = async () => {
    setRefreshing(true);
    setStats(HARDCODED_STATS);
    setRefreshing(false);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[PRIMARY]}
        />
      }
    >
      <ProfileHeader
        user={
          user || {
            id: "u1",
            _id: "u1",
            name: "Akin Zulu",
            email: "akin.zulu@africanintelligence.com",
            role: "student",
            avatar: "https://via.placeholder.com/100x100?text=AZ",
          }
        }
        rank={stats.rank}
        colors={{ PRIMARY, TEXT_PRIMARY: themeColors.text }}
      />
      <StatsSection
        stats={stats}
        colors={{
          CARD_BACKGROUND: themeColors.cardBackground,
          BORDER_COLOR: themeColors.borderColor,
          TEXT_PRIMARY: themeColors.text,
          TEXT_SECONDARY: themeColors.textSecondary,
        }}
      />
      <AchievementsSection
        expanded={expandedSections.achievements}
        onToggle={() => toggleSection("achievements")}
        stats={{
          certificates: stats.certificates,
          achievements: stats.achievements,
        }}
        colors={{
          CARD_BACKGROUND: themeColors.cardBackground,
          BORDER_COLOR: themeColors.borderColor,
          TEXT_PRIMARY: themeColors.text,
          TEXT_SECONDARY: themeColors.textSecondary,
        }}
      />
      <AccountSettingsSection
        expanded={expandedSections.account}
        onToggle={() => toggleSection("account")}
        showEditProfile={false}
        setShowEditProfile={() => {}}
        showChangePassword={false}
        setShowChangePassword={() => {}}
        editingUser={{
          name: user?.name || "Akin Zulu",
          email: user?.email || "akin.zulu@africanintelligence.com",
          avatar: user?.avatar || "https://via.placeholder.com/100x100?text=AZ",
        }}
        setEditingUser={() => {}}
        onSaveProfile={async () => {
          toast({
            title: "Profile Update Disabled",
            description: "Profile updates are not supported in demo mode",
            variant: "destructive",
          });
        }}
        passwordData={{
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
        setPasswordData={() => {}}
        onChangePassword={async () => {
          toast({
            title: "Password Change Disabled",
            description: "Password changes are not supported in demo mode",
            variant: "destructive",
          });
        }}
        notificationsEnabled={notificationsEnabled}
        onNotificationToggle={handleNotificationToggle}
        emailNotificationsEnabled={false}
        onEmailNotificationToggle={() => {
          toast({
            title: "Email Notifications Disabled",
            description: "Email notifications are not supported in demo mode",
            variant: "destructive",
          });
        }}
        smsNotificationsEnabled={false}
        onSmsNotificationToggle={() => {
          toast({
            title: "SMS Notifications Disabled",
            description: "SMS notifications are not supported in demo mode",
            variant: "destructive",
          });
        }}
        pushNotificationsEnabled={false}
        onPushNotificationToggle={() => {
          toast({
            title: "Push Notifications Disabled",
            description: "Push notifications are not supported in demo mode",
            variant: "destructive",
          });
        }}
        darkModeEnabled={isDarkMode}
        onDarkModeToggle={toggleTheme}
        colors={{
          PRIMARY,
          CARD_BACKGROUND: themeColors.cardBackground,
          BORDER_COLOR: themeColors.borderColor,
          TEXT_PRIMARY: themeColors.text,
          TEXT_SECONDARY: themeColors.textSecondary,
        }}
      />
      <SupportSection
        expanded={expandedSections.support}
        onToggle={() => toggleSection("support")}
        showHelp={false}
        setShowHelp={() => {}}
        showContact={false}
        setShowContact={() => {}}
        showPrivacy={false}
        setShowPrivacy={() => {}}
        showTerms={false}
        setShowTerms={() => {}}
        showApiDocs={false}
        setShowApiDocs={() => {}}
        contactData={{ subject: "", message: "" }}
        setContactData={() => {}}
        onSendContact={async () => {
          toast({
            title: "Contact Support Disabled",
            description: "Contact support is not supported in demo mode",
            variant: "destructive",
          });
        }}
        colors={{
          PRIMARY,
          CARD_BACKGROUND: themeColors.cardBackground,
          BORDER_COLOR: themeColors.borderColor,
          TEXT_PRIMARY: themeColors.text,
          TEXT_SECONDARY: themeColors.textSecondary,
        }}
      />
      <LogoutButton
        onLogout={handleLogout}
        colors={{
          BORDER_COLOR: themeColors.borderColor,
          TEXT_PRIMARY: themeColors.text,
        }}
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
