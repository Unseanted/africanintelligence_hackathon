import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface VersionInfoProps {
  version: string;
  color: string;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ version, color }) => (
  <View style={styles.versionContainer}>
    <Text style={[styles.versionText, { color }]}>{version}</Text>
  </View>
);

const styles = StyleSheet.create({
  versionContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom:72,
  },
  versionText: {
    fontSize: 12,
  },
});

export default VersionInfo; 