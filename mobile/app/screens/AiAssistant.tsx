import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, TextInput, Text, IconButton } from 'react-native-paper';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AiAssistant = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I understand your question. Let me help you with that...',
        timestamp: new Date().toISOString(),
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const renderMessage = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.type === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{msg.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(msg.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Card style={styles.card}>
        <Card.Title
          title="AI Assistant"
          subtitle="Ask me anything about your learning materials"
          left={(props) => (
            <IconButton
              {...props}
              icon={() => <Text style={{ color: '#2563eb' }}>🤖</Text>}
              size={24}
            />
          )}
        />
      </Card>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {chatHistory.map(renderMessage)}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          style={styles.input}
          multiline
        />
        <IconButton
          icon={() => <Text style={{ color: '#2563eb' }}>📤</Text>}
          size={24}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageContent: {
    gap: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
});

export default AiAssistant; 