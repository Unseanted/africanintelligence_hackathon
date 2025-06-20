import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { currentCourse, currentLesson, token, API_URL } = useTourLMS();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token || !isOpen) return;

    const newSocket = io('https://africanapi.onrender.com', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to AI chat');
    });

    newSocket.on('ai:response', (data) => {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        timestamp: new Date(data.timestamp)
      }]);
      setIsTyping(false);
    });

    newSocket.on('ai:typing', (typing) => {
      setIsTyping(typing);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      
      let errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again.";
      
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        errorMessage = "You've reached the message limit. Please wait a moment before sending more messages.";
      } else if (error.code === 'OPENAI_RATE_LIMIT') {
        errorMessage = "The AI service is currently busy. Please try again in a few moments.";
      }

      setChat(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      }]);
      setIsTyping(false);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping || !socket) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Send message through WebSocket
    socket.emit('ai:message', {
      message: userMessage.content,
      context: {
        courseId: currentCourse?.id,
        lessonId: currentLesson?.id
      }
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen && !isMinimized && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-purple-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-purple-700"
            onClick={() => setIsOpen(true)}
          >
            <Bot className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-96"
          >
            <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/student/ai-assistant')}
                  title="Open full chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {chat.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Bot className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p>How can I help you today?</p>
                      <Button
                        variant="link"
                        className="mt-2 text-purple-500"
                        onClick={() => navigate('/student/ai-assistant')}
                      >
                        Open full chat
                      </Button>
                    </div>
                  ) : (
                    chat.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : msg.isError
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-slate-700'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3 flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t dark:border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button type="submit" size="icon" disabled={isTyping || !message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot; 