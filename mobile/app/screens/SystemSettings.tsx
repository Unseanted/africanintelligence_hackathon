import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Switch, Button } from 'react-native-paper';

export default function SystemSettings() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">System Settings</Text>
        
        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-4">Platform Settings</Text>
            
            <View className="flex-row justify-between items-center mb-4">
              <Text>Maintenance Mode</Text>
              <Switch value={false} />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text>User Registration</Text>
              <Switch value={true} />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text>Course Creation</Text>
              <Switch value={true} />
            </View>

            <View className="flex-row justify-between items-center">
              <Text>Forum Access</Text>
              <Switch value={true} />
            </View>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-4">Notification Settings</Text>
            
            <View className="flex-row justify-between items-center mb-4">
              <Text>Email Notifications</Text>
              <Switch value={true} />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text>Push Notifications</Text>
              <Switch value={true} />
            </View>

            <View className="flex-row justify-between items-center">
              <Text>System Alerts</Text>
              <Switch value={true} />
            </View>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-4">Security Settings</Text>
            
            <View className="flex-row justify-between items-center mb-4">
              <Text>Two-Factor Authentication</Text>
              <Switch value={true} />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text>Session Timeout</Text>
              <Switch value={true} />
            </View>

            <View className="flex-row justify-between items-center">
              <Text>IP Restrictions</Text>
              <Switch value={false} />
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" className="mt-4">
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
} 