// components/ai-assistant/AIAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, SendHorizonal, BookOpen, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';

const AIAssistant = ({ courseId, currentLesson }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { token } = useTourLMS();
  const { toast } = useToast();

  // Initial system message with context
  const systemMessage = {
    role: "system",
    content: `You are an AI teaching assistant for an online learning platform. 
    The user is currently studying ${currentLesson?.title || 'a course'}. 
    Provide helpful, concise explanations and guidance. 
    When appropriate, suggest relevant course materials. 
    Always maintain a supportive, professional tone.`
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm your AI learning assistant. How can I help you with your studies today?"
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [systemMessage, ...messages, userMessage],
          courseId,
          lessonId: currentLesson?.id
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      {isOpen && (
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
                className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800'
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