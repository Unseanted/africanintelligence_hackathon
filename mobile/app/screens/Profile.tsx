import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { useTourLMS } from '../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY } from './constants/colors';

export default function Profile() {
  const { user } = useTourLMS();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.split(' ').map(n => n[0]).join('') || 'U'} 
        />
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email'}</Text>
      </View>
      
      <Button 
        mode="contained" 
        onPress={() => {/* Handle logout */}}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    opacity: 0.7,
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: PRIMARY,
  },
}); 