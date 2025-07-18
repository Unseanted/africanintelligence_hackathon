import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';

export default function UserProfile() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="items-center mb-6">
          <Avatar.Text size={80} label="JD" />
          <Text className="text-2xl font-bold mt-2">John Doe</Text>
          <Text className="text-gray-600">Student</Text>
        </View>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Profile Information</Text>
            <Text>Email: john.doe@example.com</Text>
            <Text>Joined: January 2024</Text>
            <Text>Courses Enrolled: 3</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Progress</Text>
            <Text>Overall Completion: 75%</Text>
            <Text>Certificates Earned: 2</Text>
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={() => {/* TODO: Implement edit profile */}}
          className="mt-4"
        >
          Edit Profile
        </Button>
      </View>
    </ScrollView>
  );
} 