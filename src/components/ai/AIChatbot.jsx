import React, { useState } from 'react';
import { Bot, X, Send, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useNavigate } from 'react-router-dom';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { currentCourse, currentLesson } = useTourLMS();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    setChat(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');

    // TODO: Add actual AI integration here
    // For now, just simulate a response
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: 'I am your AI learning assistant. How can I help you today?' 
      }]);
    }, 1000);
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
                              : 'bg-gray-100 dark:bg-slate-700'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t dark:border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
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