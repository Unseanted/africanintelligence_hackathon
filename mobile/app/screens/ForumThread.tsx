import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button } from 'react-native-paper';

export default function ForumThread() {
  const [comment, setComment] = useState('');

  const handlePost = () => {
    // TODO: Implement comment posting
    console.log('Posting comment:', comment);
    setComment('');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Discussion Thread</Text>
        
        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Original Post</Text>
            <Text>How do I get started with machine learning?</Text>
            <Text className="text-gray-500 mt-2">Posted by John Doe • 2 hours ago</Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-2">Comments</Text>
            <Text>No comments yet.</Text>
          </Card.Content>
        </Card>

        <View className="mt-4">
          <TextInput
            label="Add a comment"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            className="mb-2"
          />
          <Button 
            mode="contained" 
            onPress={handlePost}
            disabled={!comment.trim()}
          >
            Post Comment
          </Button>
        </View>
      </View>
    </ScrollView>
  );
} 