import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Searchbar, List } from 'react-native-paper';

export default function AdminUsers() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">User Management</Text>
        
        <Searchbar
          placeholder="Search users..."
          className="mb-4"
        />

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-4">User Statistics</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-3xl font-bold">0</Text>
                <Text>Total Users</Text>
              </View>
              <View>
                <Text className="text-3xl font-bold">0</Text>
                <Text>Active Users</Text>
              </View>
              <View>
                <Text className="text-3xl font-bold">0</Text>
                <Text>New Today</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-4">Recent Users</Text>
            <List.Item
              title="No users found"
              description="Start adding users to see them here"
              left={props => <List.Icon {...props} icon="account" />}
            />
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-4">User Roles</Text>
            <List.Item
              title="Administrators"
              description="0 users"
              left={props => <List.Icon {...props} icon="shield-account" />}
            />
            <List.Item
              title="Facilitators"
              description="0 users"
              left={props => <List.Icon {...props} icon="account-tie" />}
            />
            <List.Item
              title="Students"
              description="0 users"
              left={props => <List.Icon {...props} icon="school" />}
            />
          </Card.Content>
        </Card>

        <Button mode="contained" className="mt-4">
          Add New User
        </Button>
      </View>
    </ScrollView>
  );
} 