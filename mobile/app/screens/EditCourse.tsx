import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';

export default function EditCourse() {
  const [title, setTitle] = useState('Introduction to AI');
  const [description, setDescription] = useState('Learn the basics of AI and machine learning');
  const [duration, setDuration] = useState('8');

  const handleSave = () => {
    // TODO: Implement course update
    console.log('Updating course:', { title, description, duration });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Edit Course</Text>
        
        <TextInput
          label="Course Title"
          value={title}
          onChangeText={setTitle}
          className="mb-4"
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className="mb-4"
        />

        <TextInput
          label="Duration (weeks)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          className="mb-4"
        />

        <Button 
          mode="contained" 
          onPress={handleSave}
          className="mt-4"
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
} 