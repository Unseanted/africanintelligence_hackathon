import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function Profile() {
  // Placeholder user data - replace with actual user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Student',
    joinDate: 'January 2024',
    progress: {
      coursesCompleted: 3,
      certificates: 2,
      currentStreak: 5,
    },
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <ThemedText type="title">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="title">{userData.name}</ThemedText>
              <ThemedText>{userData.email}</ThemedText>
              <ThemedText style={styles.role}>{userData.role}</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.statsCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Learning Stats</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText type="title">{userData.progress.coursesCompleted}</ThemedText>
              <ThemedText>Courses Completed</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{userData.progress.certificates}</ThemedText>
              <ThemedText>Certificates</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{userData.progress.currentStreak}</ThemedText>
              <ThemedText>Day Streak</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.settingsCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account Settings</ThemedText>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <ThemedText>Edit Profile</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <ThemedText>Notification Settings</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <ThemedText>Privacy Settings</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <ThemedText>Help & Support</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  role: {
    marginTop: 4,
    opacity: 0.7,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    paddingVertical: 8,
  },
}); 