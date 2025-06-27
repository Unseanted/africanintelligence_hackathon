import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, BookOpen, Brain, Code, HelpCircle, MessageSquare, Loader2, Upload, File, X, Settings, Plus, Clock, Trash2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { offlineStorage } from '@/utils/offlineStorage';
import { notificationService } from '@/utils/notificationService';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Required env: VITE_AI_ASSISTANT_URL
const AI_ASSISTANT_URL = import.meta.env.VITE_API_URL;

/*
  Setup:
  - Set default model state

  Creating Conversation:
  - Clicking "New Chat" button
  - Sending a message when no chat is selected

  Clicking new chat:
  - Call create conversation api and update current conversation and model state
  
  Opening conversation:
  - Update current conversation state

  Delete conversation: 
  - call delete endpoint

  Archive conversation:
  - mark as archived

 */
const AIAssistantPage = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mistral-large-latest');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const fileInputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [socket, setSocket] = useState(null);
  const { token } = useAuth();

  // Mock context data - replace with actual context
  const currentCourse = { title: "Advanced React Development" };
  const currentLesson = { title: "Custom Hooks and Context API" };

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4'},
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo'},
    { id: 'claude-3', name: 'Claude 3'},
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'mistral-large-latest', name: 'Mistral Large' }
  ];

  const oldSuggestedQuestions = [
    "Explain the current lesson concepts",
    "Create a practice quiz for me",
    "Help me debug my code",
    "Summarize today's learning objectives",
    "What are the key takeaways?",
    "Give me related resources"
  ];

  const suggestedQuestions = [
    "Create a practice quiz for me",
    "Help me debug my code",
  ]

  // Fetch all conversations and their messages on mount
  useEffect(() => {
    if (!token) return;
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${AI_ASSISTANT_URL}/assistant/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const conversations = Array.isArray(res.data) ? res.data : [];
        // Fetch messages for each conversation
        const chatsWithMessages = await Promise.all(conversations.map(async (conv) => {
          const msgRes = await axios.get(`${AI_ASSISTANT_URL}/assistant/conversations/${conv._id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { ...conv, id: conv._id, messages: Array.isArray(msgRes.data) ? msgRes.data : [] };
        }));
        setChatHistory(chatsWithMessages);
        if (chatsWithMessages.length > 0) {
          setCurrentChatId(chatsWithMessages[0].id);
          setChat(chatsWithMessages[0]);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchChats();
  }, [token]);

  // Update current chat when currentChatId changes
  useEffect(() => {
    if (!currentChatId) { setChat(null); return; }
    const found = chatHistory.find(c => c.id === currentChatId);
    setChat(found || null);
  }, [currentChatId, chatHistory]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;
    const newSocket = io(AI_ASSISTANT_URL, {
      transports: ['websocket'],
      auth: { token }
    });

    newSocket.on('connect', () => { setIsOnline(true); console.log('connected to wss'); });
    newSocket.on('disconnect', () => setIsOnline(false));
    newSocket.on('pong', (data) => {
      console.log('pong');
    });
    newSocket.on('ai:response', (data) => {
      const aiMsg = data.message;
      setChatHistory(prev => prev.map(c =>
        c.id === aiMsg.conversationId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      ));
      if (chat && chat.id === aiMsg.conversationId) {
        setChat(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
      }
      setIsTyping(false);
    });
    newSocket.on('ai:typing', (typing) => setIsTyping(typing));
    newSocket.on('error', (error) => {
      setIsTyping(false);
      // Optionally show notification
    });
    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, [token]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chat]);

  // Create new chat
  const createNewChat = async () => {
    try {
      const newChatReq = { title: 'New Conversation', aiModel: selectedModel };
      const res = await axios.post(`${AI_ASSISTANT_URL}/assistant/conversations`, newChatReq, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const conv = res.data.conversation;
        const chatObj = { ...conv, id: conv.id, messages: [] };
        setChatHistory(prev => [chatObj, ...prev]);
        setCurrentChatId(chatObj.id);
        setChat(chatObj);
        setMessage('');
        setAttachedFiles([]);
      }
    } catch (err) {
      // Optionally show notification
    }
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`${AI_ASSISTANT_URL}/assistant/conversations/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistory(prev => prev.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setChat(null);
        setMessage('');
        setAttachedFiles([]);
      }
    } catch (err) {
      // Optionally show notification
    }
  };

  // Send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isTyping || !socket || !chat) return;
    const userMessage = message.trim();
    setMessage('');
    const newMsg = {
      conversationId: chat.id,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      model: selectedModel
    };
    setChat(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
    console.log("chat", chat);
    setChatHistory(prev => prev.map(c =>
      c.id === chat.id ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setIsTyping(true);
    try {
      console.log('sending message');
      socket.emit('ai:message', { message: userMessage, context: { conversationId: chat.id, aiModel: selectedModel, role: 'user', tokenCount: 0, timestamp: Date.now() } });
      console.log('message sent');
    } catch (err) {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSuggestedQuestion = (question) => {
    setMessage(question);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatChatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Learning Assistant
              </h1>
              <p className="text-sm text-muted-foreground">Your intelligent study companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="outline" className="flex items-center gap-1 text-yellow-600">
                <WifiOff className="w-3 h-3" />
                Offline
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Online
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Chat History */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat History
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={createNewChat}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ScrollArea className="h-[300px]">
                  {chatHistory.map((chatItem) => (
                    <div
                      key={chatItem.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        currentChatId === chatItem.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setCurrentChatId(chatItem.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chatItem.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatChatTime(chatItem.timestamp)}</span>
                          <Badge variant="outline" className="text-xs">
                            {aiModels.find(m => m.id === chatItem.model)?.name}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chatItem.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: HelpCircle, label: "Get Help", color: "text-blue-500" },
                  { icon: Code, label: "Debug Code", color: "text-green-500" },
                  { icon: BookOpen, label: "Summarize", color: "text-purple-500" },
                  { icon: MessageSquare, label: "Practice Quiz", color: "text-orange-500" }
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                    onClick={() => handleSuggestedQuestion(`${action.label.toLowerCase()} with current lesson`)}
                  >
                    <action.icon className={`w-3 h-3 mr-2 ${action.color}`} />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Chat Assistant Boo
                    </CardTitle>
                    <CardDescription>
                      Ask me anything about your courses, concepts, or get help with assignments
                    </CardDescription>
                  </div>
                  {isTyping && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Thinking...
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-1 p-0">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                  {!chat || !chat.messages || chat.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full mb-4">
                        <Bot className="w-12 h-12 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to help you learn!</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        I can help with explanations, practice questions, code debugging, and more.
                      </p>
                      {/* Suggested Questions */}
                      <div className="w-full max-w-2xl">
                        <p className="text-sm font-medium mb-3">Try asking:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {suggestedQuestions.map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-left h-auto py-2 px-3"
                              onClick={() => handleSuggestedQuestion(question)}
                            >
                              <span className="text-xs">{question}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {chat.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-purple-500' : 'bg-muted'}`}>
                              {msg.role === 'user' ? (
                                <div className="w-4 h-4 bg-white rounded-full" />
                              ) : (
                                <Bot className="w-4 h-4" />
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-purple-500 text-white'
                                : msg.isError
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-muted'
                            }`}>
                              {msg.files && msg.files.length > 0 && (
                                <div className="mb-2 space-y-1">
                                  {msg.files.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1">
                                      <File className="w-3 h-3" />
                                      <span>{file.name}</span>
                                      <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm">{msg.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className={`text-xs opacity-70 ${msg.role === 'user' ? 'text-purple-100' : 'text-muted-foreground'}`}>
                                  {formatTime(new Date(msg.timestamp))}
                                </p>
                                {msg.model && (
                                  <Badge variant="outline" className="text-xs">
                                    {aiModels.find(m => m.id === msg.model)?.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-2">
                            <div className="p-2 rounded-full bg-muted">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <Separator />

                {/* Message Input */}
                <div className="py-4">
                  <div className="flex flex-col gap-3">
                    {/* File Preview Area */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
                        {attachedFiles.map(file => (
                          <Badge 
                            key={file.id} 
                            variant="secondary" 
                            className="flex items-center gap-1.5 px-2 py-1.5"
                          >
                            <File className="w-3.5 h-3.5" />
                            <span className="text-xs max-w-[150px] truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="ml-1 hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Input Area */}
                    <div className="flex items-center gap-2">
                      {/* File Upload Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => fileInputRef.current?.click()}
                              className="shrink-0 h-11 w-11"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Attach files</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                      />
                      <div className="flex-1 relative">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                          placeholder="Ask me anything about your studies..."
                          className="pr-32 h-11"
                          disabled={isTyping}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger className="h-7 w-[8vw] text-xs border-0 bg-transparent hover:bg-transparent focus:ring-0">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {aiModels.map(model => (
                                <SelectItem key={model.id} value={model.id}>
                                  <div className="flex flex-col">
                                    <span>{model.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={handleSubmit}
                            size="icon"
                            disabled={!message.trim() || isTyping}
                            className="shrink-0 h-7 w-7"
                          >
                            {isTyping ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;