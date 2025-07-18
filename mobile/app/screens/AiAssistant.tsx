import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Card,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useTourLMS } from "../contexts/TourLMSContext";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "sending" | "delivered" | "error";
}

const AiAssistant = () => {
  const { colors } = useTheme();
  const { user, token } = useTourLMS();
  const { socket } = useTourLMS();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize with welcome message
  useEffect(() => {
    setChatHistory([
      {
        id: "welcome",
        type: "assistant",
        content:
          "Hello! I'm your AI learning assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleAIResponse = (response: {
      message: string;
      messageId: string;
    }) => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === response.messageId
            ? { ...msg, content: response.message, status: "delivered" }
            : msg
        )
      );
      setIsLoading(false);
    };

    const handleAIError = (error: { messageId: string; error: string }) => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === error.messageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                status: "error",
              }
            : msg
        )
      );
      setIsLoading(false);
    };

    socket.on("ai:response", handleAIResponse);
    socket.on("ai:error", handleAIError);

    return () => {
      socket.off("ai:response", handleAIResponse);
      socket.off("ai:error", handleAIError);
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    const aiResponsePlaceholder: Message = {
      id: `ai-${Date.now()}`,
      type: "assistant",
      content: "...",
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setChatHistory((prev) => [...prev, userMessage, aiResponsePlaceholder]);
    setMessage("");
    setIsLoading(true);

    try {
      // In a real implementation, you would send this to your backend
      if (socket) {
        socket.emit("ai:question", {
          userId: user?._id,
          message: message,
          messageId: aiResponsePlaceholder.id,
          token,
        });
      } else {
        // Fallback to simulated response if socket isn't available
        setTimeout(() => {
          setChatHistory((prev) =>
            prev.map((msg) =>
              msg.id === aiResponsePlaceholder.id
                ? {
                    ...msg,
                    content:
                      "I'm a simulated response. In a real implementation, I'd connect to an AI service.",
                    status: "delivered",
                  }
                : msg
            )
          );
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === aiResponsePlaceholder.id
            ? { ...msg, content: "Failed to send message", status: "error" }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const renderMessage = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.type === "user"
          ? { ...styles.userMessage, backgroundColor: colors.primary }
          : { ...styles.assistantMessage, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.messageContent}>
        {msg.content === "..." && msg.status === "sending" ? (
          <ActivityIndicator color={colors.onSurface} />
        ) : (
          <Text
            style={[
              styles.messageText,
              msg.type === "user"
                ? { color: colors.onPrimary }
                : { color: colors.onSurface },
            ]}
          >
            {msg.content}
          </Text>
        )}
        <Text
          style={[
            styles.timestamp,
            msg.type === "user"
              ? { color: colors.onPrimary + "aa" }
              : { color: colors.onSurface + "aa" },
          ]}
        >
          {format(new Date(msg.timestamp), "h:mm a")}
          {msg.status === "error" && " · Failed"}
        </Text>
      </View>
    </View>
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title
          title="AI Assistant"
          titleStyle={{ color: colors.onSurface }}
          subtitle="Ask me anything about your learning materials"
          subtitleStyle={{ color: colors.onSurface + "aa" }}
          left={(props) => (
            <IconButton
              {...props}
              icon="robot"
              iconColor={colors.primary}
              size={24}
            />
          )}
        />
      </Card>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        {chatHistory.map(renderMessage)}
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.inputContainer, { backgroundColor: colors.surface }]}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor={colors.onSurface + "77"}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.onSurface,
            },
          ]}
          multiline
          maxLength={500}
          onSubmitEditing={handleSendMessage}
          right={
            <TextInput.Icon
              icon="send"
              color={message.trim() ? colors.primary : colors.onSurface + "55"}
              onPress={handleSendMessage}
              disabled={!message.trim() || isLoading}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  assistantMessage: {
    alignSelf: "flex-start",
  },
  messageContent: {
    gap: 4,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 120,
  },
});

export default AiAssistant;
