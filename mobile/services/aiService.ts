import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';

const API_URL = Constants.expoConfig?.extra?.apiUrl || '';
const JWT_TOKEN = Constants.expoConfig?.extra?.jwtToken || '';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export class AIService {
  private static instance: AIService;
  private token: string;
  private socket: Socket | null = null;

  private constructor() {
    this.token = JWT_TOKEN;
    if (!this.token) {
      console.error('JWT token not found');
    }
    this.initializeSocket();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeSocket() {
    this.socket = io(API_URL, {
      auth: { token: this.token },
      transports: ['websocket'],
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(title: string, aiModel = 'mistral-large-latest') {
    const response = await fetch(`${API_URL}/assistant/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, aiModel }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create conversation');
    }

    const data = await response.json();
    return data.conversation;
  }

  /**
   * Send message via socket
   */
  sendMessage(
    content: string,
    context: {
      conversationId: string;
      aiModel: string;
      tokenCount: number;
      courseId?: string;
      lessonId?: string;
    },
    onResponse: (message: Message) => void,
    onTyping?: (typing: boolean) => void
  ) {
    if (!this.socket) throw new Error('Socket not initialized');

    // Listen for AI typing indicator
    if (onTyping) {
      this.socket.on('ai:typing', onTyping);
    }

    // Listen for AI response
    this.socket.once('ai:response', (data: any) => {
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(data.timestamp),
      };
      onResponse(aiMessage);
    });

    // Emit message to AI
    this.socket.emit('ai:message', {
      message: content,
      context: {
        ...context,
        role: 'user',
        timestamp: Date.now(),
      },
    });
  }
}
