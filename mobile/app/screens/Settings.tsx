import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Button, Text, Divider, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIMARY } from '../constants/colors';

// Color Constants
const BACKGROUND = '#111827';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9CA3AF';
const CARD_BACKGROUND = 'rgba(255, 255, 255, 0.05)';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)';

export default function Settings() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [locationServices, setLocationServices] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <View style={[styles.header, { backgroundColor: PRIMARY }]}>
        <Text style={[styles.headerTitle, { color: TEXT_PRIMARY }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: TEXT_PRIMARY }]}>Customize your experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Appearance</Text>
        <List.Section>
          <List.Item
            title="Dark Mode"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={PRIMARY} />}
            right={props => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Language"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="translate" color={PRIMARY} />}
            onPress={() => {}}
          />
          <List.Item
            title="Font Size"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="format-size" color={PRIMARY} />}
            onPress={() => {}}
          />
        </List.Section>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Notifications</Text>
        <List.Section>
          <List.Item
            title="Enable Notifications"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="bell" color={PRIMARY} />}
            right={props => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Email Notifications"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="email" color={PRIMARY} />}
            right={props => (
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Push Notifications"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="cellphone" color={PRIMARY} />}
            right={props => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Sound Effects"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="volume-high" color={PRIMARY} />}
            right={props => (
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                color={PRIMARY}
              />
            )}
          />
        </List.Section>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Privacy & Security</Text>
        <List.Section>
          <List.Item
            title="Biometric Authentication"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="fingerprint" color={PRIMARY} />}
            right={props => (
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Location Services"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="map-marker" color={PRIMARY} />}
            right={props => (
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Data Sync"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="sync" color={PRIMARY} />}
            right={props => (
              <Switch
                value={dataSync}
                onValueChange={setDataSync}
                color={PRIMARY}
              />
            )}
          />
        </List.Section>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Account</Text>
        <List.Section>
          <List.Item
            title="Edit Profile"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="account-edit" color={PRIMARY} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={TEXT_SECONDARY} />}
          />
          <List.Item
            title="Change Password"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="lock" color={PRIMARY} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={TEXT_SECONDARY} />}
          />
          <List.Item
            title="Privacy Settings"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="shield-account" color={PRIMARY} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={TEXT_SECONDARY} />}
          />
          <List.Item
            title="Two-Factor Authentication"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="cellphone-key" color={PRIMARY} />}
            onPress={() => {}}
          />
          <List.Item
            title="Delete Account"
            titleStyle={{ color: PRIMARY }}
            left={props => <List.Icon {...props} icon="delete" color={PRIMARY} />}
            onPress={() => {}}
          />
        </List.Section>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Support</Text>
        <List.Section>
          <List.Item
            title="Help Center"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="help-circle" color={PRIMARY} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={TEXT_SECONDARY} />}
          />
          <List.Item
            title="Contact Support"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="message" color={PRIMARY} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={TEXT_SECONDARY} />}
          />
          <List.Item
            title="About"
            titleStyle={{ color: TEXT_PRIMARY }}
            left={props => <List.Icon {...props} icon="information" color={PRIMARY} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={TEXT_SECONDARY} />}
          />
        </List.Section>
      </View>

      <Button
        mode="outlined"
        onPress={() => router.back()}
        style={[styles.logoutButton, { borderColor: BORDER_COLOR }]}
        textColor={TEXT_PRIMARY}
      >
        Log Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
}); 