// components/ai-assistant/AIAssistant.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, SendHorizonal, BookOpen, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { io } from "socket.io-client";

const AI_ASSISTANT_URL = import.meta.env.VITE_API_URL;

const DEFAULT_MODEL = "mistral-large-latest";

const AIAssistant = ({ courseId, currentLesson }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);
  const [socket, setSocket] = useState(null);
  const { token } = useAuth();
  const { toast } = useToast();

  // Initial system message with context
  const systemMessage = {
    role: "system",
    content: `You are an AI teaching assistant for an online learning platform. 
    The user is currently studying ${currentLesson?.title || "a course"}. 
    Provide helpful, concise explanations and guidance. 
    When appropriate, suggest relevant course materials. 
    Always maintain a supportive, professional tone.`,
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your AI learning assistant. How can I help you with your studies today?",
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // On open, create a new conversation
  useEffect(() => {
    if (!isOpen || conversationId || !token) return;
    const createConversation = async () => {
      try {
        const res = await fetch(`${AI_ASSISTANT_URL}/assistant/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Popup Chat",
            aiModel: DEFAULT_MODEL,
          }),
        });
        const data = await res.json();
        if (data && data.conversation && data.conversation.id) {
          setConversationId(data.conversation.id);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to start chat",
          variant: "destructive",
        });
      }
    };
    createConversation();
  }, [isOpen, conversationId, token]);

  // WebSocket connection
  useEffect(() => {
    if (!token || !isOpen) return;
    const newSocket = io(AI_ASSISTANT_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    newSocket.on("ai:response", (data) => {
      const aiMsg = data.message;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiMsg.content },
      ]);
      setIsLoading(false);
    });
    newSocket.on("ai:typing", (typing) => setIsLoading(typing));
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [token, isOpen]);

  // Message send handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !socket || !conversationId) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      socket.emit("ai:message", {
        message: input,
        context: {
          conversationId,
          aiModel: DEFAULT_MODEL,
          role: "user",
          tokenCount: 0,
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Floating Assistant Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg"
        >
          <Bot size={24} />
        </Button>
      )}

      {/* Assistant Panel */}
      {!isOpen && (
        <Card className="fixed bottom-8 right-8 w-96 h-[32rem] flex flex-col shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="text-purple-600" />
              <h3 className="font-semibold">Learning Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 pb-2">
            <div className="text-xs text-gray-500 mb-1">Quick Prompts:</div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("Summarize this lesson")}
              >
                <BookOpen size={14} className="mr-1" /> Summarize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("Explain the key concepts")}
              >
                <Sparkles size={14} className="mr-1" /> Key Concepts
              </Button>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your learning question..."
                className="resize-none"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                <SendHorizonal size={18} />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
};

export default AIAssistant;
