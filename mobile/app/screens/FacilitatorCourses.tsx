import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function FacilitatorCourses() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">My Courses</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('CreateCourse')}
          >
            Create Course
          </Button>
        </View>
        <Text>Manage your courses and track student progress here.</Text>
      </View>
    </ScrollView>
  );
} 