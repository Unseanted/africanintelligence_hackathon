import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function FacilitatorAnalytics() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Analytics</Text>
        
        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Course Overview</Text>
            <Text>Total Courses: 0</Text>
            <Text>Active Students: 0</Text>
            <Text>Average Completion Rate: 0%</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Student Performance</Text>
            <Text>No student data available yet.</Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Engagement Metrics</Text>
            <Text>No engagement data available yet.</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 