import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm your AI learning assistant. How can I help you today?",
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
      >
        <MaterialCommunityIcons name="robot" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <MaterialCommunityIcons name="robot" size={24} color="#6366f1" />
                <ThemedText style={styles.title}>AI Assistant</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.chatContainer}
            >
              <ScrollView style={styles.messagesContainer}>
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    <ThemedText style={styles.messageText}>{message.text}</ThemedText>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.inputContainer}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSend}
                >
                  <MaterialCommunityIcons name="send" size={24} color="#6366f1" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 106,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: '#ffffff',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 