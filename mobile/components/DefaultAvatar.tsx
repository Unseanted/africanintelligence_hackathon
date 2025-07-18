import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface DefaultAvatarProps {
  size?: number;
  style?: any;
}

export default function DefaultAvatar({ size = 40, style }: DefaultAvatarProps) {
  return (
    <Image
      source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#e1e1e1',
  },
}); 