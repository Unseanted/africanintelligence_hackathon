import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Chip, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const categories = ['ai', 'ml', 'programming', 'projects', 'general'];

export default function CreateThread() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigation = useNavigation();
  const theme = useTheme();

  const handleCreate = () => {
    if (!title.trim() || !content.trim() || !selectedCategory) return;
    
    // TODO: Implement thread creation
    console.log('Creating thread:', { title, content, category: selectedCategory });
    
    // Navigate back to forum
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Thread Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        label="Content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
        style={styles.input}
      />

      <View style={styles.categoryContainer}>
        <Button 
          mode="outlined" 
          onPress={() => {}} 
          style={styles.categoryButton}
        >
          Select Category
        </Button>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map(category => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={styles.categoryChip}
            >
              {category.toUpperCase()}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <Button 
        mode="contained" 
        onPress={handleCreate}
        disabled={!title.trim() || !content.trim() || !selectedCategory}
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
      >
        Create Thread
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryButton: {
    marginBottom: 12,
  },
  categories: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: 8,
  },
  createButton: {
    marginTop: 8,
  },
}); 