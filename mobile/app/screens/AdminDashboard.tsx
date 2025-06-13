import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Admin Dashboard</Text>
        
        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">System Overview</Text>
            <Text>Total Users: 0</Text>
            <Text>Active Courses: 0</Text>
            <Text>Total Facilitators: 0</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Quick Actions</Text>
            <View className="space-y-2">
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('UserManagement')}
              >
                Manage Users
              </Button>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('SystemSettings')}
              >
                System Settings
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Recent Activity</Text>
            <Text>No recent activity to display.</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 