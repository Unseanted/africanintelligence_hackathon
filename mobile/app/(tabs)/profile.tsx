import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Avatar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, PRIMARY } from '../constants/colors';

export default function Profile() {
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Avatar.Image
            size={100}
            source={{ uri: 'https://ui-avatars.com/api/?name=John+Doe' }}
            style={styles.avatar}
          />
          <Button
            mode="contained"
            onPress={() => router.push('/screens/Settings')}
            style={styles.settingsButton}
            buttonColor={PRIMARY}
            icon="cog"
          >
            Settings
          </Button>
        </View>
        <Text style={[styles.name, { color: TEXT_PRIMARY }]}>John Doe</Text>
        <Text style={[styles.role, { color: TEXT_SECONDARY }]}>Student</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>12</Text>
          <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Courses</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>8</Text>
          <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Badges</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>75%</Text>
          <Text style={[styles.statLabel, { color: TEXT_SECONDARY }]}>Progress</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color={PRIMARY} />
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: TEXT_PRIMARY }]}>Completed Introduction to AI</Text>
            <Text style={[styles.activityTime, { color: TEXT_SECONDARY }]}>2 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <MaterialCommunityIcons name="medal" size={24} color={PRIMARY} />
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: TEXT_PRIMARY }]}>Earned AI Explorer Badge</Text>
            <Text style={[styles.activityTime, { color: TEXT_SECONDARY }]}>Yesterday</Text>
          </View>
        </View>
      </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  settingsButton: {
    borderRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
  },
}); 