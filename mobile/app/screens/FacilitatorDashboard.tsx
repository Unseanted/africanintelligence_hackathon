import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

export default function FacilitatorDashboard() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Facilitator Dashboard</Text>
        <Text>Welcome to your facilitator dashboard. Here you can manage courses and students.</Text>
      </View>
    </ScrollView>
  );
} 