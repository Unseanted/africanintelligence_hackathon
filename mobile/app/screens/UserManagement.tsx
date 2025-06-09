import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Searchbar, List } from 'react-native-paper';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">User Management</Text>
        
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          className="mb-4"
        />

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">User Statistics</Text>
            <Text>Total Users: 0</Text>
            <Text>Active Users: 0</Text>
            <Text>New Users (Last 30 days): 0</Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Recent Users</Text>
            <List.Item
              title="No users found"
              description="Add users to see them here"
              left={props => <List.Icon {...props} icon="account" />}
            />
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => {/* TODO: Implement user creation */}}
          className="mt-4"
        >
          Add New User
        </Button>
      </View>
    </ScrollView>
  );
} 