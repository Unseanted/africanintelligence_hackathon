import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

export default function CourseDetail() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Course Details</Text>
        
        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Course Information</Text>
            <Text>Course Title: Introduction to AI</Text>
            <Text>Instructor: John Doe</Text>
            <Text>Duration: 8 weeks</Text>
            <Text>Level: Beginner</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Course Content</Text>
            <Text>No content available yet.</Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Enrollment</Text>
            <Text>Current Students: 0</Text>
            <Button mode="contained" className="mt-4">
              Enroll Now
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 