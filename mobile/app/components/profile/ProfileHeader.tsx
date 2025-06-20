import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileHeaderProps {
  user: {
    avatar?: string;
    name?: string;
    role?: string;
  };
  rank: string;
  colors: {
    PRIMARY: string;
    TEXT_PRIMARY: string;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, rank, colors }) => (
  <View style={[styles.header, { backgroundColor: colors.PRIMARY }]}> 
    <Avatar.Image 
      source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }} 
      size={100} 
      style={styles.avatar} 
    />
    <Text style={[styles.name, { color: colors.TEXT_PRIMARY }]}>{user?.name}</Text>
    <Text style={[styles.role, { color: colors.TEXT_PRIMARY }]}>{user?.role}</Text>
    <View style={styles.rankBadge}>
      <Text style={[styles.rank, { color: colors.TEXT_PRIMARY }]}>{rank}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    paddingBottom: 30,
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileHeader; 