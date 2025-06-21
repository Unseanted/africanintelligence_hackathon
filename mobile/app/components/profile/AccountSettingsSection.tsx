import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Card, List, Divider, Switch, TextInput, Button, Text, Dialog, Portal, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
];

const DUMMY_SESSIONS = [
  { id: 1, device: 'iPhone 13', location: 'Lagos, Nigeria', active: true },
  { id: 2, device: 'Chrome on Windows', location: 'Abuja, Nigeria', active: false },
];

interface AccountSettingsSectionProps {
  expanded: boolean;
  onToggle: () => void;
  showEditProfile: boolean;
  setShowEditProfile: (show: boolean) => void;
  showChangePassword: boolean;
  setShowChangePassword: (show: boolean) => void;
  editingUser: { name: string; email: string; avatar: string };
  setEditingUser: (user: { name: string; email: string; avatar: string }) => void;
  onSaveProfile: () => void;
  passwordData: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPasswordData: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  onChangePassword: () => void;
  notificationsEnabled: boolean;
  onNotificationToggle: (value: boolean) => void;
  emailNotificationsEnabled: boolean;
  onEmailNotificationToggle: (value: boolean) => void;
  smsNotificationsEnabled: boolean;
  onSmsNotificationToggle: (value: boolean) => void;
  pushNotificationsEnabled: boolean;
  onPushNotificationToggle: (value: boolean) => void;
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
  // New local states for new features
  const [language, setLanguage] = useState('en');
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [emailVisible, setEmailVisible] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState(DUMMY_SESSIONS);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setEditingUser({ ...editingUser, avatar: result.assets[0].uri });
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);
    Alert.alert('Account Deleted', 'Your account has been deleted (placeholder).');
  };

  const handleLogoutSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleDownloadData = () => {
    Alert.alert('Download Requested', 'Your data download has been requested (placeholder).');
  };

  return (
    <>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Account Settings</Text>
          <Icon 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color={colors.TEXT_PRIMARY} 
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <Card style={[styles.settingsCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
          <Card.Content>
            {/* Edit Profile */}
            <List.Item
              title="Edit Profile"
              description="Update your personal information"
              titleStyle={{ color: colors.TEXT_PRIMARY }}
              descriptionStyle={{ color: colors.TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="account-edit" color={colors.PRIMARY} />}
              onPress={() => setShowEditProfile(!showEditProfile)}
            />
            {showEditProfile && (
              <View style={{ padding: 16 }}>
                <TextInput
                  label="Name"
                  value={editingUser.name}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  onChangeText={text => setEditingUser({ ...editingUser, name: text })}
                />
                <TextInput
                  label="Email"
                  value={editingUser.email}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  keyboardType="email-address"
                  onChangeText={text => setEditingUser({ ...editingUser, email: text })}
                />
                <View style={{ marginBottom: 12 }}>
                  {editingUser.avatar ? (
                    <Image
                      source={{ uri: editingUser.avatar }}
                      style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
                    />
                  ) : null}
                  <Button mode="outlined" onPress={pickImage}>
                    Choose Image
                  </Button>
                </View>
                <Button mode="contained" onPress={onSaveProfile} style={{ marginTop: 8 }}>
                  Save Changes
                </Button>
              </View>
            )}
            <Divider style={styles.divider} />
            {/* Change Password */}
            <List.Item
              title="Change Password"
              description="Update your login credentials"
              titleStyle={{ color: colors.TEXT_PRIMARY }}
              descriptionStyle={{ color: colors.TEXT_SECONDARY }}
              left={props => <List.Icon {...props} icon="lock" color={colors.PRIMARY} />}
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
                  onChangeText={text => setPasswordData({ ...passwordData, currentPassword: text })}
                />
                <TextInput
                  label="New Password"
                  value={passwordData.newPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={text => setPasswordData({ ...passwordData, newPassword: text })}
                />
                <TextInput
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  mode="outlined"
                  secureTextEntry
                  style={{ marginBottom: 12 }}
                  onChangeText={text => setPasswordData({ ...passwordData, confirmPassword: text })}
                />
                <Button mode="contained" onPress={onChangePassword} style={{ marginTop: 8 }}>
                  Update Password
                </Button>
              </View>
            )}
            <Divider style={styles.divider} />
            {/* Language Selection (separate UI) */}
            <List.Item
              title="Language"
              description={LANGUAGES.find(l => l.value === language)?.label}
              left={props => <List.Icon {...props} icon="translate" color={colors.PRIMARY} />}
              onPress={() => setShowLanguageDialog(true)}
            />
            <Portal>
              <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
                <Dialog.Title>Select Language</Dialog.Title>
                <Dialog.Content>
                  <RadioButton.Group onValueChange={setLanguage} value={language}>
                    {LANGUAGES.map(lang => (
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
                  <Button onPress={() => setShowLanguageDialog(false)}>Done</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Divider style={styles.divider} />
            {/* Privacy Settings */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>Privacy</Text>
            <List.Item
              title="Profile Public"
              description="Allow others to view your profile"
              left={props => <List.Icon {...props} icon="account-eye" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={profilePublic} onValueChange={setProfilePublic} color={colors.PRIMARY} />
              )}
            />
            <List.Item
              title="Show Email"
              description="Allow others to see your email"
              left={props => <List.Icon {...props} icon="email" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={emailVisible} onValueChange={setEmailVisible} color={colors.PRIMARY} />
              )}
            />
            <Divider style={styles.divider} />
            {/* Notification Preferences */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>Notification Preferences</Text>
            <List.Item
              title="App Notifications"
              left={props => <List.Icon {...props} icon="bell" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={notificationsEnabled} onValueChange={onNotificationToggle} color={colors.PRIMARY} />
              )}
            />
            <List.Item
              title="Email Notifications"
              left={props => <List.Icon {...props} icon="email" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={emailNotificationsEnabled} onValueChange={onEmailNotificationToggle} color={colors.PRIMARY} />
              )}
            />
            <List.Item
              title="SMS Notifications"
              left={props => <List.Icon {...props} icon="message" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={smsNotificationsEnabled} onValueChange={onSmsNotificationToggle} color={colors.PRIMARY} />
              )}
            />
            <List.Item
              title="Push Notifications"
              left={props => <List.Icon {...props} icon="bell-ring" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={pushNotificationsEnabled} onValueChange={onPushNotificationToggle} color={colors.PRIMARY} />
              )}
            />
            <Divider style={styles.divider} />
            {/* Theme Customization: Only Light/Dark Mode */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>Theme</Text>
            <List.Item
              title={darkModeEnabled ? 'Dark Mode' : 'Light Mode'}
              description={darkModeEnabled ? 'App is in dark mode' : 'App is in light mode'}
              left={props => <List.Icon {...props} icon="theme-light-dark" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={darkModeEnabled} onValueChange={onDarkModeToggle} color={colors.PRIMARY} />
              )}
            />
            <Divider style={styles.divider} />
            {/* Two-Factor Authentication */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>Security</Text>
            <List.Item
              title="Two-Factor Authentication (2FA)"
              description="Add extra security to your account"
              left={props => <List.Icon {...props} icon="shield-key" color={colors.PRIMARY} />}
              right={props => (
                <Switch value={twoFAEnabled} onValueChange={setTwoFAEnabled} color={colors.PRIMARY} />
              )}
            />
            <Divider style={styles.divider} />
            {/* Session Management */}
            <Text style={[styles.subheading, { color: colors.TEXT_PRIMARY }]}>Active Sessions</Text>
            {sessions.map(session => (
              <View key={session.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Icon name="cellphone" size={20} color={colors.PRIMARY} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.TEXT_PRIMARY, flex: 1 }}>{session.device} ({session.location})</Text>
                {session.active && <Text style={{ color: 'green', marginRight: 8 }}>Active</Text>}
                <Button mode="text" onPress={() => handleLogoutSession(session.id)} textColor="red">Log Out</Button>
              </View>
            ))}
            <Divider style={styles.divider} />
            {/* Download My Data */}
            <Button mode="outlined" onPress={handleDownloadData} style={{ marginBottom: 12 }}>
              Download My Data
            </Button>
            {/* Account Deletion */}
            <Button mode="contained" onPress={() => setShowDeleteDialog(true)} style={{ backgroundColor: 'red', marginTop: 4 }}>
              Delete Account
            </Button>
            <Portal>
              <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
                <Dialog.Title>Delete Account</Dialog.Title>
                <Dialog.Content>
                  <Text>Are you sure you want to delete your account? This action cannot be undone.</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
                  <Button onPress={handleDeleteAccount} textColor="red">Delete</Button>
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
    marginVertical: 4,
    backgroundColor: '#e0e0e0',
  },
});

export default AccountSettingsSection; 