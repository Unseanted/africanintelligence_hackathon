import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function AdminAnalytics() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">System Analytics</Text>
        
        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Platform Overview</Text>
            <Text>Total Users: 0</Text>
            <Text>Total Courses: 0</Text>
            <Text>Total Revenue: $0</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">User Engagement</Text>
            <Text>Active Users: 0</Text>
            <Text>Average Session Duration: 0 min</Text>
            <Text>Course Completion Rate: 0%</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Content Performance</Text>
            <Text>Most Popular Course: None</Text>
            <Text>Average Course Rating: 0/5</Text>
            <Text>Total Course Views: 0</Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">System Health</Text>
            <Text>Server Uptime: 100%</Text>
            <Text>Average Response Time: 0ms</Text>
            <Text>Error Rate: 0%</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 