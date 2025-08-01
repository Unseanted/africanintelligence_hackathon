import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useTheme } from '../../app/contexts/ThemeContext';

// Default avatar image (replace with your app's local asset or configurable default)
const DEFAULT_AVATAR = 'https://via.placeholder.com/150'; // Example fallback; use local asset in production

interface ProfileHeaderProps {
  user: {
    avatar?: string;
    name?: string;
    role?: string;
  };
  rank: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, rank }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Avatar.Image
        source={{ uri: user?.avatar || DEFAULT_AVATAR }}
        size={100}
        style={[styles.avatar, { borderColor: colors.text }]}
      />
      <Text style={[styles.name, { color: colors.text }]}>
        {user?.name || 'Unknown User'}
      </Text>
      <Text style={[styles.role, { color: colors.text }]}>
        {user?.role || 'No Role'}
      </Text>
      <View style={[styles.rankBadge, { backgroundColor: colors.text + '33' }]}>
        <Text style={[styles.rank, { color: colors.text }]}>
          {rank || 'No Rank'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center' as 'center',
    paddingBottom: 30,
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    marginBottom: 8,
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold' as 'bold',
  },
});

export default ProfileHeader;