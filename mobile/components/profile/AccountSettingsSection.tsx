import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
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
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useTourLMS } from '../../app/contexts/TourLMSContext';
import { authenticator } from 'otplib';

interface Session {
  id: number;
  device: string;
  location: string;
  active: boolean;
  lastActive: string;
  ipAddress: string;
}

// Fix 1: Align EditingUser with Profile component (phone is required)
interface EditingUser {
  name: string;
  email: string;
  avatar: string;
  phone: string; // Required, not optional
}

interface AccountSettingsSectionProps {
  expanded: boolean;
  onToggle: () => void;
  showEditProfile: boolean;
  setShowEditProfile: (show: boolean) => void;
  showChangePassword: boolean;
  setShowChangePassword: (show: boolean) => void;
  editingUser: EditingUser;
  setEditingUser: React.Dispatch<React.SetStateAction<EditingUser>>;
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
}

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
];

type IconName =
  | 'cellphone-iphone'
  | 'cellphone-android'
  | 'laptop'
  | 'devices'
  | React.ComponentProps<typeof MaterialCommunityIcons>['name'];

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
}) => {
  const { colors } = useTheme();
  const { logout, user } = useTourLMS();
  const [language, setLanguage] = useState('en');
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
  const [twoFACode, setTwoFACode] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const TOTP_SECRET = 'JBSWY3DPEHPK3PXP'; // Placeholder; store securely server-side in production

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockSessions: Session[] = [
          {
            id: 1,
            device: `${Platform.OS === 'ios' ? 'iPhone' : 'Android'} ${Platform.Version}`,
            location: 'New York, US',
            active: true,
            lastActive: new Date().toISOString(),
            ipAddress: '192.168.1.1',
          },
          {
            id: 2,
            device: 'Chrome on Windows',
            location: 'London, UK',
            active: false,
            lastActive: new Date(Date.now() - 86400000).toISOString(),
            ipAddress: '203.0.113.42',
          },
        ];
        setSessions(mockSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        Alert.alert('Error', 'Failed to fetch sessions. Please try again.');
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'We need access to your photos to upload an image.'
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
        setEditingUser({ ...editingUser, avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogoutSession = async (id: number) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSessions(sessions.filter((s) => s.id !== id));
      if (id === 1) {
        Alert.alert('Logged Out', 'You have been logged out from this device.');
        logout();
      } else {
        Alert.alert('Session Ended', 'The selected session has been logged out.');
      }
    } catch (error) {
      console.error('Error logging out session:', error);
      Alert.alert('Error', 'Failed to log out session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setDownloading(true);
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

      const fileName = `user_data_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(userData, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert('Download Complete', `Your data has been prepared and saved as ${fileName}.`, [
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Error downloading data:', error);
      Alert.alert('Error', 'Failed to prepare your data. Please try again.');
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
        await new Promise((resolve) => setTimeout(resolve, 800));
        setTwoFAEnabled(false);
        Alert.alert('2FA Disabled', 'Two-factor authentication has been disabled.');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        Alert.alert('Error', 'Failed to disable 2FA. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const verifyTwoFACode = async () => {
    try {
      setLoading(true);
      const isValid = authenticator.verify({
        token: twoFACode,
        secret: TOTP_SECRET,
      });

      if (isValid) {
        setTwoFAEnabled(true);
        setShow2FADialog(false);
        setTwoFACode('');
        Alert.alert('2FA Enabled', 'Two-factor authentication has been enabled.');
      } else {
        throw new Error('Invalid code');
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const notificationsSent: string[] = [];

      // Check notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission required', 'Please enable notifications to test.');
          return;
        }
      }

      if (pushNotificationsEnabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Test Notification',
            body: 'This is a test push notification from your app settings.',
          },
          trigger: null, // Immediate delivery
        });
        notificationsSent.push('push');
      }

      if (smsNotificationsEnabled) {
        const isSMSSupported = await SMS.isAvailableAsync();
        if (!isSMSSupported) {
          Alert.alert('Error', 'SMS is not supported on this device.');
          return;
        }

        const phone =
          editingUser.phone || (user && 'phone' in user ? (user as { phone?: string }).phone : '');
        if (phone && validatePhone(phone)) {
          await SMS.sendSMSAsync([phone], 'This is a test SMS notification from your app.');
          notificationsSent.push('SMS');
        } else {
          Alert.alert(
            'No Phone Number',
            'Please add a valid phone number in your profile to test SMS notifications.'
          );
          return;
        }
      }

      if (notificationsSent.length > 0) {
        Alert.alert(
          'Test Sent',
          `Test ${notificationsSent.join(' and ')} notification(s) sent successfully.`
        );
      } else {
        Alert.alert(
          'No Notifications Sent',
          'Please enable push or SMS notifications to test.'
        );
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
      Alert.alert('Error', 'Failed to send test notifications.');
    }
  };

  const formatLastActive = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      }
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getDeviceIcon = (device: string): IconName => {
    if (device.includes('iPhone')) return 'cellphone-iphone' as IconName;
    if (device.includes('Android')) return 'cellphone-android' as IconName;
    if (device.includes('Windows') || device.includes('Mac')) return 'laptop' as IconName;
    return 'devices' as IconName; // Fallback icon
  };

  return (
    <>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.text}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <Card
          style={[styles.settingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
        >
          <Card.Content>
            {loading && (
              <View style={[styles.loadingOverlay, { backgroundColor: colors.surface + 'B3' }]}>
                <ActivityIndicator animating={true} color={colors.primary} size="large" />
              </View>
            )}

            {/* Edit Profile */}
            <List.Item
              title="Edit Profile"
              description="Update your personal information"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="account-edit" color={colors.primary} />
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
                  onChangeText={(text) => setEditingUser({ ...editingUser, name: text })}
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
                />
                <TextInput
                  label="Email"
                  value={editingUser.email}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  keyboardType="email-address"
                  onChangeText={(text) => setEditingUser({ ...editingUser, email: text })}
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
                />
                <TextInput
                  label="Phone Number"
                  value={editingUser.phone}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  keyboardType="phone-pad"
                  onChangeText={(text) => {
                    setEditingUser({ ...editingUser, phone: text });
                    if (text && !validatePhone(text)) {
                      setPhoneError('Please enter a valid phone number (e.g., +1234567890)');
                    } else {
                      setPhoneError(null);
                    }
                  }}
                  error={!!phoneError}
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
                />
                {phoneError && (
                  <Text style={{ color: colors.error, marginBottom: 12 }}>{phoneError}</Text>
                )}
                <View style={{ marginBottom: 12 }}>
                  {editingUser.avatar ? (
                    <Image
                      source={{ uri: editingUser.avatar }}
                      style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={80}
                      color={colors.textSecondary}
                      style={{ marginBottom: 8 }}
                    />
                  )}
                  <Button
                    mode="outlined"
                    onPress={pickImage}
                    loading={uploading}
                    disabled={uploading}
                    textColor={colors.text}
                    style={{ borderColor: colors.borderColor }}
                  >
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                </View>
                <Button
                  mode="contained"
                  onPress={onSaveProfile}
                  style={{ marginTop: 8 }}
                  loading={loading}
                  disabled={loading || !!phoneError}
                  buttonColor={colors.primary}
                  textColor={colors.text}
                >
                  Save Changes
                </Button>
              </View>
            )}
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Change Password */}
            <List.Item
              title="Change Password"
              description="Update your login credentials"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="lock" color={colors.primary} />
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
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
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
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
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
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
                />
                <Button
                  mode="contained"
                  onPress={onChangePassword}
                  style={{ marginTop: 8 }}
                  loading={loading}
                  disabled={loading}
                  buttonColor={colors.primary}
                  textColor={colors.text}
                >
                  Update Password
                </Button>
              </View>
            )}
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Language Selection */}
            <List.Item
              title="Language"
              description={LANGUAGES.find((l) => l.value === language)?.label}
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="translate" color={colors.primary} />
              )}
              onPress={() => setShowLanguageDialog(true)}
            />
            <Portal>
              <Dialog
                visible={showLanguageDialog}
                onDismiss={() => setShowLanguageDialog(false)}
                style={{ backgroundColor: colors.cardBackground }}
              >
                <Dialog.Title style={{ color: colors.text }}>Select Language</Dialog.Title>
                <Dialog.Content>
                  <RadioButton.Group onValueChange={setLanguage} value={language}>
                    {LANGUAGES.map((lang) => (
                      <RadioButton.Item
                        key={lang.value}
                        label={lang.label}
                        value={lang.value}
                        color={colors.primary}
                        labelStyle={{ color: colors.text }}
                      />
                    ))}
                  </RadioButton.Group>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowLanguageDialog(false)} textColor={colors.text}>
                    Done
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Privacy Settings */}
            <Text style={[styles.subheading, { color: colors.text }]}>Privacy</Text>
            <List.Item
              title="Profile Public"
              description="Allow others to view your profile"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="account-eye" color={colors.primary} />
              )}
              right={() => (
                <Switch value={profilePublic} onValueChange={setProfilePublic} color={colors.primary} />
              )}
            />
            <List.Item
              title="Show Email"
              description="Allow others to see your email"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="email" color={colors.primary} />
              )}
              right={() => (
                <Switch value={emailVisible} onValueChange={setEmailVisible} color={colors.primary} />
              )}
            />
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Notification Preferences */}
            <Text style={[styles.subheading, { color: colors.text }]}>Notification Preferences</Text>
            <List.Item
              title="App Notifications"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="bell" color={colors.primary} />
              )}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={onNotificationToggle}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title="Email Notifications"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="email" color={colors.primary} />
              )}
              right={() => (
                <Switch
                  value={emailNotificationsEnabled}
                  onValueChange={onEmailNotificationToggle}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title="SMS Notifications"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="message" color={colors.primary} />
              )}
              right={() => (
                <Switch
                  value={smsNotificationsEnabled}
                  onValueChange={onSmsNotificationToggle}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title="Push Notifications"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="bell-ring" color={colors.primary} />
              )}
              right={() => (
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={onPushNotificationToggle}
                  color={colors.primary}
                />
              )}
            />
            <Button
              mode="outlined"
              onPress={testNotification}
              style={{ marginTop: 8, marginBottom: 16, borderColor: colors.borderColor }}
              textColor={colors.text}
            >
              Test Notifications
            </Button>
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Theme Customization */}
            <Text style={[styles.subheading, { color: colors.text }]}>Theme</Text>
            <List.Item
              title={darkModeEnabled ? 'Dark Mode' : 'Light Mode'}
              description={darkModeEnabled ? 'App is in dark mode' : 'App is in light mode'}
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="theme-light-dark" color={colors.primary} />
              )}
              right={() => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={onDarkModeToggle}
                  color={colors.primary}
                />
              )}
            />
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Security */}
            <Text style={[styles.subheading, { color: colors.text }]}>Security</Text>
            <List.Item
              title="Two-Factor Authentication (2FA)"
              description="Add extra security to your account"
              left={(props: { color: string }) => (
                <List.Icon {...props} icon="shield-key" color={colors.primary} />
              )}
              right={() => (
                <Switch value={twoFAEnabled} onValueChange={toggleTwoFA} color={colors.primary} />
              )}
            />
            <Portal>
              <Dialog
                visible={show2FADialog}
                onDismiss={() => setShow2FADialog(false)}
                style={{ backgroundColor: colors.cardBackground }}
              >
                <Dialog.Title style={{ color: colors.text }}>
                  Enable Two-Factor Authentication
                </Dialog.Title>
                <Dialog.Content>
                  <Text style={{ color: colors.text, marginBottom: 16 }}>
                    Scan the QR code with your authenticator app or enter the code manually:
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: 16,
                      fontSize: 18,
                    }}
                  >
                    {TOTP_SECRET}
                  </Text>
                  <TextInput
                    label="Verification Code"
                    value={twoFACode}
                    mode="outlined"
                    keyboardType="numeric"
                    onChangeText={setTwoFACode}
                    style={{ marginBottom: 16 }}
                    theme={{ colors: { primary: colors.primary, text: colors.text } }}
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      setShow2FADialog(false);
                      setTwoFACode('');
                    }}
                    textColor={colors.text}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={verifyTwoFACode}
                    disabled={!twoFACode || twoFACode.length < 6}
                    textColor={colors.text}
                  >
                    Verify
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Session Management */}
            <Text style={[styles.subheading, { color: colors.text }]}>Active Sessions</Text>
            {loading && sessions.length === 0 ? (
              <ActivityIndicator
                animating={true}
                color={colors.primary}
                style={{ marginVertical: 16 }}
              />
            ) : sessions.length === 0 ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginVertical: 16,
                }}
              >
                No active sessions found
              </Text>
            ) : (
              sessions.map((session) => (
                <View key={session.id} style={styles.sessionContainer}>
                  <View style={styles.sessionIcon}>
                    <MaterialCommunityIcons
                      name={getDeviceIcon(session.device)}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.sessionDetails}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{session.device}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {session.location} • {session.ipAddress}
                    </Text>
                    <Text
                      style={{
                        color: session.active ? colors.success : colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      {session.active ? 'Active now' : `Last active: ${formatLastActive(session.lastActive)}`}
                    </Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => handleLogoutSession(session.id)}
                    textColor={session.active ? colors.error : colors.textSecondary}
                  >
                    {session.active ? 'Log Out' : 'Remove'}
                  </Button>
                </View>
              ))
            )}
            <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Data Management */}
            <Button
              mode="outlined"
              onPress={handleDownloadData}
              style={{ marginBottom: 12, borderColor: colors.borderColor }}
              loading={downloading}
              disabled={downloading}
              textColor={colors.text}
            >
              {downloading ? 'Preparing Data...' : 'Download My Data'}
            </Button>

            <Button
              mode="contained"
              onPress={() => setShowDeleteDialog(true)}
              buttonColor={colors.error}
              textColor={colors.text}
            >
              Delete Account
            </Button>

            <Portal>
              <Dialog
                visible={showDeleteDialog}
                onDismiss={() => setShowDeleteDialog(false)}
                style={{ backgroundColor: colors.cardBackground }}
              >
                <Dialog.Title style={{ color: colors.text }}>Delete Account</Dialog.Title>
                <Dialog.Content>
                  <Text style={{ color: colors.text }}>
                    Are you sure you want to delete your account? This action cannot be undone.
                  </Text>
                  <Text style={{ color: colors.text, marginTop: 8, fontWeight: 'bold' }}>
                    All your data will be permanently removed.
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowDeleteDialog(false)} textColor={colors.text}>
                    Cancel
                  </Button>
                  <Button
                    onPress={handleDeleteAccount}
                    textColor={colors.error}
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
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 12,
  },
  sessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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