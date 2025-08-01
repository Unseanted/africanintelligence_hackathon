import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from '../app/contexts/ThemeContext';
import { AIService } from '../services/aiService';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function AIAssistant() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const aiService = AIService.getInstance();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    aiService.sendMessage(
      userMessage.text,
      {
        conversationId: 'demo-convo-001', // TODO: Dynamically get or create this
        aiModel: 'mistral-large-latest',
        tokenCount: userMessage.text.split(' ').length, // simple token count estimate
      },
      (aiMessage) => {
        const formattedMessage: Message = {
          id: Date.now().toString(),
          text: aiMessage.content,
          isUser: false,
        };
        setMessages(prev => [...prev, formattedMessage]);
        setLoading(false);
      },
      (typing) => {
        setLoading(typing);
      }
    );
  };

  useEffect(() => {
    if (isVisible) {
      // Only run when modal is opened
      aiService.createConversation("New Chat").then(convo => {
        console.log("Started conversation:", convo.id);
        // Save this ID and pass it to `sendMessage`
      }).catch(console.error);
    }
  }, [isVisible]);


  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        handleSend();
      }
    }
  };

  const styles = createStyles(colors);

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
      >
        <MaterialCommunityIcons name="robot" size={24} color={colors.onPrimary} />
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
                <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
                <Text style={styles.title}>AI Assistant</Text>
              </View>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.chatContainer}
            >
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
              >
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                ))}
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
              </ScrollView>

              <View style={styles.inputContainer}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask me anything..."
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  multiline
                  maxLength={500}
                  editable={!loading}
                  onKeyPress={handleKeyPress}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    if (!loading && input.trim()) {
                      handleSend();
                    }
                  }}
                />
                <TouchableOpacity
                  style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <MaterialCommunityIcons
                    name="send"
                    size={24}
                    color={loading || !input.trim() ? colors.textSecondary : colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 106,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.shadow,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.borderColor,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: colors.surfaceVariant,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: colors.onSurface,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: colors.onSurface,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
});