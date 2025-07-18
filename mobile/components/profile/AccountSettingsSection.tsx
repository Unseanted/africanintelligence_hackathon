import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as SMS from "expo-sms";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Divider,
  List,
  Portal,
  RadioButton,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTourLMS } from "../../contexts/TourLMSContext";

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
];

interface Session {
  id: number;
  device: string;
  location: string;
  active: boolean;
  lastActive: string;
  ipAddress: string;
}

interface AccountSettingsSectionProps {
  expanded: boolean;
  onToggle: () => void;
  showEditProfile: boolean;
  setShowEditProfile: (show: boolean) => void;
  showChangePassword: boolean;
  setShowChangePassword: (show: boolean) => void;
  editingUser: { name: string; email: string; avatar: string };
  setEditingUser: (user: {
    name: string;
    email: string;
    avatar: string;
  }) => void;
  onSaveProfile: () => Promise<void>;
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordData: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  onChangePassword: () => Promise<void>;
  notificationsEnabled: boolean;
  onNotificationToggle: (value: boolean) => Promise<void>;
  emailNotificationsEnabled: boolean;
  onEmailNotificationToggle: (value: boolean) => Promise<void>;
  smsNotificationsEnabled: boolean;
  onSmsNotificationToggle: (value: boolean) => Promise<void>;
  pushNotificationsEnabled: boolean;
  onPushNotificationToggle: (value: boolean) => Promise<void>;
  darkModeEnabled: boolean;
  onDarkModeToggle: (value: boolean) => void;
  colors: {
    PRIMARY: string;
    CARD_BACKGROUND: string;
    BORDER_COLOR: string;
    TEXT_PRIMARY: string;
    TEXT_SECONDARY: string;
  };
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  expanded,
  onToggle,
  showEditProfile,
  setShowEditProfile,
  showChangePassword,
  setShowChangePassword,
  editingUser,
  setEditingUser,
  onSaveProfile,
  passwordData,
  setPasswordData,
  onChangePassword,
  notificationsEnabled,
  onNotificationToggle,
  emailNotificationsEnabled,
  onEmailNotificationToggle,
  smsNotificationsEnabled,
  onSmsNotificationToggle,
  pushNotificationsEnabled,
  onPushNotificationToggle,
  darkModeEnabled,
  onDarkModeToggle,
  colors,
}) => {
  const { logout } = useTourLMS();
  const [language, setLanguage] = useState("en");
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [emailVisible, setEmailVisible] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");

  // Fetch active sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockSessions: Session[] = [
          {
            id: 1,
            device: `${Platform.OS === "ios" ? "iPhone" : "Android"} ${
              Platform.Version
            }`,
            location: "New York, US",
            active: true,
            lastActive: new Date().toISOString(),
            ipAddress: "192.168.1.1",
          },
          {
            id: 2,
            device: "Chrome on Windows",
            location: "London, UK",
            active: false,
            lastActive: new Date(Date.now() - 86400000).toISOString(),
            ipAddress: "203.0.113.42",
          },
        ];
        setSessions(mockSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (expanded) {
      fetchSessions();
    }
  }, [expanded]);

  const pickImage = async () => {
    try {
      setUploading(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photos to upload an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        // In a real app, you would upload this to your server
        setEditingUser({ ...editingUser, avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted."
      );
      logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogoutSession = async (id: number) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSessions(sessions.filter((s) => s.id !== id));
      if (id === 1) {
        // Current session
        Alert.alert("Logged Out", "You have been logged out from this device.");
        logout();
      } else {
        Alert.alert(
          "Session Ended",
          "The selected session has been logged out."
        );
      }
    } catch (error) {
      console.error("Error logging out session:", error);
      Alert.alert("Error", "Failed to log out session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setDownloading(true);

      // Simulate data collection and preparation
      const userData = {
        profile: editingUser,
        settings: {
          language,
          profilePublic,
          emailVisible,
          twoFAEnabled,
          notifications: {
            app: notificationsEnabled,
            email: emailNotificationsEnabled,
            sms: smsNotificationsEnabled,
            push: pushNotificationsEnabled,
          },
          darkMode: darkModeEnabled,
        },
        sessions,
      };

      // Create a JSON file
      const fileName = `user_data_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(userData, null, 2),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      // Share the file (simulated - in a real app, you might use a sharing API)
      Alert.alert(
        "Download Complete",
        `Your data has been prepared and saved as ${fileName}. In a real app, this would trigger a download.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error downloading data:", error);
      Alert.alert("Error", "Failed to prepare your data. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const toggleTwoFA = async () => {
    if (!twoFAEnabled) {
      setShow2FADialog(true);
    } else {
      try {
        setLoading(true);
        // Simulate API call to disable 2FA
        await new Promise((resolve) => setTimeout(resolve, 800));
        setTwoFAEnabled(false);
        Alert.alert(
          "2FA Disabled",
          "Two-factor authentication has been disabled."
        );
      } catch (error) {
        console.error("Error disabling 2FA:", error);
        Alert.alert("Error", "Failed to disable 2FA. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const verifyTwoFACode = async () => {
    try {
      setLoading(true);
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (twoFACode === "123456") {
        // Hardcoded for demo
        setTwoFAEnabled(true);
        setShow2FADialog(false);
        setTwoFACode("");
        Alert.alert(
          "2FA Enabled",
          "Two-factor authentication has been enabled."
        );
      } else {
        throw new Error("Invalid code");
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      Alert.alert("Error", "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      if (pushNotificationsEnabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Test Notification",
            body: "This is a test notification from your app settings.",
          },
          trigger: { seconds: 1, type: "interval", repeats: false },
        });
      }

      if (smsNotificationsEnabled && (await SMS.isAvailableAsync())) {
        await SMS.sendSMSAsync(
          ["+1234567890"], // Replace with actual number in a real app
          "This is a test SMS notification from your app."
        );
      }

      Alert.alert("Test Sent", "Test notifications have been triggered.");
    } catch (error) {
      console.error("Error testing notifications:", error);
      Alert.alert("Error", "Failed to send test notifications.");
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
            Account Settings
          </Text>
          <Icon
            name={expanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={colors.TEXT_PRIMARY}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <Card
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.CARD_BACKGROUND,
              borderColor: colors.BORDER_COLOR,
            },
          ]}
        >
          <Card.Content>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator
                  animating={true}
                  color={colors.PRIMARY}
                  size="large"
                />
              </View>
            )}

            {/* Edit Profile */}
            <List.Item
              title="Edit Profile"
              description="Update your personal information"
              titleStyle={{ color: colors.TEXT_PRIMARY }}
              descriptionStyle={{ color: colors.TEXT_SECONDARY }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="account-edit"
                  color={colors.PRIMARY}
                />
              )}
              onPress={() => setShowEditProfile(!showEditProfile)}
            />
            {showEditProfile && (
              <View style={{ padding: 16 }}>
                <TextInput
                  label="Name"
                  value={editingUser.name}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) =>
                    setEditingUser({ ...editingUser, name: text })
                  }
                />
                <TextInput
                  label="Email"
                  value={editingUser.email}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  keyboardType="email-address"
                  onChangeText={(text) =>
                    setEditingUser({ ...editingUser, email: text })
                  }
                />
                <View style={{ marginBottom: 12 }}>
                  {editingUser.avatar ? (
                    <Image
                      source={{ uri: editingUser.avatar }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        marginBottom: 8,
                      }}
                    />
                  ) : (
                    <Icon
                      name="account-circle"
                      size={80}
                      color={colors.TEXT_SECONDARY}
                      style={{ marginBottom: 8 }}
                    />
                  )}
                  <Button
                    mode="outlined"
                    onPress={pickImage}
                    loading={uploading}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Choose Image"}
                  </Button>
                </View>
                <Button
                  mode="contained"
                  onPress={onSaveProfile}
                  style={{ marginTop: 8 }}
                  loading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </View>
            )}
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Change Password */}
            <List.Item
              title="Change Password"
              description="Update your login credentials"
              titleStyle={{ color: colors.TEXT_PRIMARY }}
              descriptionStyle={{ color: colors.TEXT_SECONDARY }}
              left={(props) => (
                <List.Icon {...props} icon="lock" color={colors.PRIMARY} />
              )}
              onPress={() => setShowChangePassword(!showChangePassword)}
            />
            {showChangePassword && (
              <View style={{ padding: 16 }}>
                <TextInput
                  label="Current Password"
                  value={passwordData.currentPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                />
                <TextInput
                  label="New Password"
                  value={passwordData.newPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                />
                <TextInput
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                />
                <Button
                  mode="contained"
                  onPress={onChangePassword}
                  style={{ marginTop: 8 }}
                  loading={loading}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </View>
            )}
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Language Selection */}
            <List.Item
              title="Language"
              description={LANGUAGES.find((l) => l.value === language)?.label}
              left={(props) => (
                <List.Icon {...props} icon="translate" color={colors.PRIMARY} />
              )}
              onPress={() => setShowLanguageDialog(true)}
            />
            <Portal>
              <Dialog
                visible={showLanguageDialog}
                onDismiss={() => setShowLanguageDialog(false)}
                style={{ backgroundColor: colors.CARD_BACKGROUND }}
              >
                <Dialog.Title style={{ color: colors.TEXT_PRIMARY }}>
                  Select Language
                </Dialog.Title>
                <Dialog.Content>
                  <RadioButton.Group
                    onValueChange={setLanguage}
                    value={language}
                  >
                    {LANGUAGES.map((lang) => (
                      <RadioButton.Item
                        key={lang.value}
                        label={lang.label}
                        value={lang.value}
                        color={colors.PRIMARY}
                        labelStyle={{ color: colors.TEXT_PRIMARY }}
                      />
                    ))}
                  </RadioButton.Group>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowLanguageDialog(false)}>
                    Done
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Privacy Settings */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>
              Privacy
            </Text>
            <List.Item
              title="Profile Public"
              description="Allow others to view your profile"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="account-eye"
                  color={colors.PRIMARY}
                />
              )}
              right={(props) => (
                <Switch
                  value={profilePublic}
                  onValueChange={setProfilePublic}
                  color={colors.PRIMARY}
                />
              )}
            />
            <List.Item
              title="Show Email"
              description="Allow others to see your email"
              left={(props) => (
                <List.Icon {...props} icon="email" color={colors.PRIMARY} />
              )}
              right={(props) => (
                <Switch
                  value={emailVisible}
                  onValueChange={setEmailVisible}
                  color={colors.PRIMARY}
                />
              )}
            />
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Notification Preferences */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>
              Notification Preferences
            </Text>
            <List.Item
              title="App Notifications"
              left={(props) => (
                <List.Icon {...props} icon="bell" color={colors.PRIMARY} />
              )}
              right={(props) => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={onNotificationToggle}
                  color={colors.PRIMARY}
                />
              )}
            />
            <List.Item
              title="Email Notifications"
              left={(props) => (
                <List.Icon {...props} icon="email" color={colors.PRIMARY} />
              )}
              right={(props) => (
                <Switch
                  value={emailNotificationsEnabled}
                  onValueChange={onEmailNotificationToggle}
                  color={colors.PRIMARY}
                />
              )}
            />
            <List.Item
              title="SMS Notifications"
              left={(props) => (
                <List.Icon {...props} icon="message" color={colors.PRIMARY} />
              )}
              right={(props) => (
                <Switch
                  value={smsNotificationsEnabled}
                  onValueChange={onSmsNotificationToggle}
                  color={colors.PRIMARY}
                />
              )}
            />
            <List.Item
              title="Push Notifications"
              left={(props) => (
                <List.Icon {...props} icon="bell-ring" color={colors.PRIMARY} />
              )}
              right={(props) => (
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={onPushNotificationToggle}
                  color={colors.PRIMARY}
                />
              )}
            />
            <Button
              mode="outlined"
              onPress={testNotification}
              style={{ marginTop: 8, marginBottom: 16 }}
            >
              Test Notifications
            </Button>
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Theme Customization */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>
              Theme
            </Text>
            <List.Item
              title={darkModeEnabled ? "Dark Mode" : "Light Mode"}
              description={
                darkModeEnabled ? "App is in dark mode" : "App is in light mode"
              }
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="theme-light-dark"
                  color={colors.PRIMARY}
                />
              )}
              right={(props) => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={onDarkModeToggle}
                  color={colors.PRIMARY}
                />
              )}
            />
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Security */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>
              Security
            </Text>
            <List.Item
              title="Two-Factor Authentication (2FA)"
              description="Add extra security to your account"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="shield-key"
                  color={colors.PRIMARY}
                />
              )}
              right={(props) => (
                <Switch
                  value={twoFAEnabled}
                  onValueChange={toggleTwoFA}
                  color={colors.PRIMARY}
                />
              )}
            />
            <Portal>
              <Dialog
                visible={show2FADialog}
                onDismiss={() => setShow2FADialog(false)}
                style={{ backgroundColor: colors.CARD_BACKGROUND }}
              >
                <Dialog.Title style={{ color: colors.TEXT_PRIMARY }}>
                  Enable Two-Factor Authentication
                </Dialog.Title>
                <Dialog.Content>
                  <Text
                    style={{ color: colors.TEXT_PRIMARY, marginBottom: 16 }}
                  >
                    Scan the QR code with your authenticator app or enter the
                    code manually:
                  </Text>
                  <Text
                    style={{
                      color: colors.PRIMARY,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: 16,
                      fontSize: 18,
                    }}
                  >
                    JBSWY3DPEHPK3PXP
                  </Text>
                  <TextInput
                    label="Verification Code"
                    value={twoFACode}
                    mode="outlined"
                    keyboardType="numeric"
                    onChangeText={setTwoFACode}
                    style={{ marginBottom: 16 }}
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      setShow2FADialog(false);
                      setTwoFACode("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={verifyTwoFACode}
                    disabled={!twoFACode || twoFACode.length < 6}
                  >
                    Verify
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Session Management */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>
              Active Sessions
            </Text>
            {loading && sessions.length === 0 ? (
              <ActivityIndicator
                animating={true}
                color={colors.PRIMARY}
                style={{ marginVertical: 16 }}
              />
            ) : sessions.length === 0 ? (
              <Text
                style={{
                  color: colors.TEXT_SECONDARY,
                  textAlign: "center",
                  marginVertical: 16,
                }}
              >
                No active sessions found
              </Text>
            ) : (
              sessions.map((session) => (
                <View key={session.id} style={styles.sessionContainer}>
                  <View style={styles.sessionIcon}>
                    <Icon
                      name={
                        session.device.includes("iPhone")
                          ? "cellphone-iphone"
                          : session.device.includes("Android")
                          ? "cellphone-android"
                          : "laptop"
                      }
                      size={24}
                      color={colors.PRIMARY}
                    />
                  </View>
                  <View style={styles.sessionDetails}>
                    <Text
                      style={{ color: colors.TEXT_PRIMARY, fontWeight: "bold" }}
                    >
                      {session.device}
                    </Text>
                    <Text
                      style={{ color: colors.TEXT_SECONDARY, fontSize: 12 }}
                    >
                      {session.location} • {session.ipAddress}
                    </Text>
                    <Text
                      style={{
                        color: session.active ? "green" : colors.TEXT_SECONDARY,
                        fontSize: 12,
                      }}
                    >
                      {session.active
                        ? "Active now"
                        : `Last active: ${formatLastActive(
                            session.lastActive
                          )}`}
                    </Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => handleLogoutSession(session.id)}
                    textColor={session.active ? "red" : colors.TEXT_SECONDARY}
                  >
                    {session.active ? "Log Out" : "Remove"}
                  </Button>
                </View>
              ))
            )}
            <Divider
              style={[styles.divider, { backgroundColor: colors.BORDER_COLOR }]}
            />

            {/* Data Management */}
            <Button
              mode="outlined"
              onPress={handleDownloadData}
              style={{ marginBottom: 12 }}
              loading={downloading}
              disabled={downloading}
            >
              {downloading ? "Preparing Data..." : "Download My Data"}
            </Button>

            <Button
              mode="contained"
              onPress={() => setShowDeleteDialog(true)}
              style={{ backgroundColor: "red" }}
            >
              Delete Account
            </Button>

            <Portal>
              <Dialog
                visible={showDeleteDialog}
                onDismiss={() => setShowDeleteDialog(false)}
                style={{ backgroundColor: colors.CARD_BACKGROUND }}
              >
                <Dialog.Title style={{ color: colors.TEXT_PRIMARY }}>
                  Delete Account
                </Dialog.Title>
                <Dialog.Content>
                  <Text style={{ color: colors.TEXT_PRIMARY }}>
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </Text>
                  <Text
                    style={{
                      color: colors.TEXT_PRIMARY,
                      marginTop: 8,
                      fontWeight: "bold",
                    }}
                  >
                    All your data will be permanently removed.
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onPress={handleDeleteAccount}
                    textColor="red"
                    loading={loading}
                    disabled={loading}
                  >
                    Delete Permanently
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </Card.Content>
        </Card>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderRadius: 12,
  },
  sessionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sessionIcon: {
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
});

export default AccountSettingsSection;
