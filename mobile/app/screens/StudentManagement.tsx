import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Searchbar } from 'react-native-paper';

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Student Management</Text>
        
        <Searchbar
          placeholder="Search students..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          className="mb-4"
        />

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Enrolled Students</Text>
            <Text>No students enrolled yet.</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Pending Requests</Text>
            <Text>No pending enrollment requests.</Text>
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => {/* TODO: Implement student invitation */}}
          className="mt-4"
        >
          Invite Students
        </Button>
      </View>
    </ScrollView>
  );
} 