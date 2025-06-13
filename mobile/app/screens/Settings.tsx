import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKGROUND, TEXT_PRIMARY, PRIMARY } from '../constants/colors';

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Personalization</Text>
        <List.Section>
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Language"
            description="English"
            left={props => <List.Icon {...props} icon="translate" />}
            onPress={() => {}}
          />
        </List.Section>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Notifications</Text>
        <List.Section>
          <List.Item
            title="Push Notifications"
            description="Receive notifications on your device"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={PRIMARY}
              />
            )}
          />
          <List.Item
            title="Email Updates"
            description="Receive updates via email"
            left={props => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                color={PRIMARY}
              />
            )}
          />
        </List.Section>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Preferences</Text>
        <List.Section>
          <List.Item
            title="Sound Effects"
            description="Play sounds for interactions"
            left={props => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                color={PRIMARY}
              />
            )}
          />
        </List.Section>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Account</Text>
        <List.Section>
          <List.Item
            title="Privacy Settings"
            description="Manage your privacy preferences"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
          <List.Item
            title="Change Password"
            description="Update your password"
            left={props => <List.Icon {...props} icon="lock" />}
            onPress={() => {}}
          />
          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={props => <List.Icon {...props} icon="delete" color={PRIMARY} />}
            onPress={() => {}}
          />
        </List.Section>
      </View>

      <Button
        mode="contained"
        onPress={() => router.back()}
        style={styles.saveButton}
        buttonColor={PRIMARY}
      >
        Save Changes
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
  },
  saveButton: {
    margin: 16,
    marginBottom: 32,
  },
}); 