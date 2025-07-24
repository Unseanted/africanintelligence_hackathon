import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function CreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreate = () => {
    // TODO: Implement course creation
    console.log("Creating course:", { title, description, duration });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Create New Course</Text>

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

        <Button mode="contained" onPress={handleCreate} className="mt-4">
          Create Course
        </Button>
      </View>
    </ScrollView>
  );
}
