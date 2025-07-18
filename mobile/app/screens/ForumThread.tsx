import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, TextInput, Button, IconButton, Avatar, Divider, Menu } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export default function ForumThread() {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(42);
  const [isReposted, setIsReposted] = useState(false);
  const [reposts, setReposts] = useState(5);
  const [menuVisible, setMenuVisible] = useState(false);
  const route = useRoute();
  const { threadId } = route.params as { threadId: string };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      text: 'Start with basic Python programming and then move to libraries like TensorFlow or PyTorch.',
      author: 'Jane Smith',
      timestamp: '1h ago',
      likes: 8,
      isLiked: false
    },
    {
      id: '2',
      text: 'I recommend starting with Andrew Ng\'s Machine Learning course on Coursera.',
      author: 'Mike Johnson',
      timestamp: '30m ago',
      likes: 5,
      isLiked: false
    }
  ]);

  const handlePost = () => {
    if (!comment.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      text: comment,
      author: 'Current User', // Replace with actual user
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setReposts(prev => isReposted ? prev - 1 : prev + 1);
    setMenuVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.mainCard}>
        <Card.Content>
          <View style={styles.header}>
            <Avatar.Text size={40} label="JD" />
            <View style={styles.headerText}>
              <Text style={styles.author}>John Doe</Text>
              <Text style={styles.timestamp}>Posted 2 hours ago</Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item 
                onPress={handleRepost} 
                title={isReposted ? "Undo Repost" : "Repost"}
                leadingIcon={isReposted ? "repeat-off" : "repeat"}
              />
            </Menu>
          </View>
          
          <Text style={styles.title}>How do I get started with machine learning?</Text>
          <Text style={styles.content}>
            I'm new to machine learning and want to get started. What are the best resources and steps to begin my journey?
          </Text>
          
          <View style={styles.actions}>
            <View style={styles.actionGroup}>
              <IconButton
                icon={isLiked ? "heart" : "heart-outline"}
                size={24}
                onPress={handleLike}
                iconColor={isLiked ? "#FF0000" : undefined}
              />
              <Text>{likes}</Text>
            </View>
            <View style={styles.actionGroup}>
              <IconButton
                icon={isReposted ? "repeat" : "repeat-outline"}
                size={24}
                onPress={handleRepost}
                iconColor={isReposted ? "#4CAF50" : undefined}
              />
              <Text>{reposts}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
      
      {comments.map((comment, index) => (
        <Card key={comment.id} style={styles.commentCard}>
          <Card.Content>
            <View style={styles.header}>
              <Avatar.Text size={32} label={comment.author.split(' ').map(n => n[0]).join('')} />
              <View style={styles.headerText}>
                <Text style={styles.author}>{comment.author}</Text>
                <Text style={styles.timestamp}>{comment.timestamp}</Text>
              </View>
            </View>
            
            <Text style={styles.commentText}>{comment.text}</Text>
            
            <View style={styles.actions}>
              <IconButton
                icon={comment.isLiked ? "heart" : "heart-outline"}
                size={20}
                onPress={() => handleCommentLike(comment.id)}
                iconColor={comment.isLiked ? "#FF0000" : undefined}
              />
              <Text>{comment.likes}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      <View style={styles.inputContainer}>
        <TextInput
          label="Add a comment"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Button 
          mode="contained" 
          onPress={handlePost}
          disabled={!comment.trim()}
          style={styles.postButton}
        >
          Post Comment
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainCard: {
    margin: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 12,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 8,
  },
  commentCard: {
    margin: 16,
    marginTop: 0,
  },
  commentText: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  inputContainer: {
    padding: 16,
    paddingTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  postButton: {
    marginTop: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
}); 