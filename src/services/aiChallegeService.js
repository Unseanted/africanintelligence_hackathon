// AI Challenge Generation Service
// Supports multiple AI providers: OpenAI, Anthropic, Google Gemini, Cohere

class AIChallengeService {
    constructor() {
      this.provider = import.meta.env.VITE_AI_PROVIDER || 'cohere'; // Default to 'openai' if not set
      this.apiKey = import.meta.env.VITE_AI_API_KEY;
      this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; // Default backend URL
      this.authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';
    }
  
    // Main method to generate challenges using AI
    async generateChallenges(userPreferences = {}) {
      const {
        categories = ['health', 'career', 'relationships', 'environment', 'learning', 'creativity'],
        difficulty = 'mixed',
        timeframe = 'week',
        userLevel = 1,
        completedChallenges = [],
        interests = []
      } = userPreferences;
  
      try {
        // Try backend first, fallback to direct AI API
        return await this.generateViaBackend(userPreferences) || 
               await this.generateViaDirectAI(userPreferences);
      } catch (error) {
        console.error('AI Challenge generation failed:', error);
        return this.getFallbackChallenges();
      }
    }
  
    // Backend API approach (recommended for production)
    async generateViaBackend(preferences) {
      try {
        const response = await fetch(`${this.backendUrl}/api/challenges/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            preferences,
            timestamp: Date.now()
          })
        });
  
        if (!response.ok) throw new Error(`Backend error: ${response.status}`);
        
        const data = await response.json();
        return this.formatChallenges(data.challenges);
      } catch (error) {
        console.warn('Backend generation failed, trying direct AI:', error);
        return null;
      }
    }
  
    // Direct AI API approach (for development/testing)
    async generateViaDirectAI(preferences) {
      const prompt = this.buildPrompt(preferences);
      
      switch (this.provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt);
        case 'gemini':
          return await this.generateWithGemini(prompt);
        case 'cohere':
          return await this.generateWithCohere(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    }
  
    // OpenAI GPT-4 Integration
    async generateWithOpenAI(prompt) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert life coach and challenge designer. Generate personalized, engaging challenges that help people grow and improve their lives.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });
  
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  
    // Anthropic Claude Integration
    async generateWithAnthropic(prompt) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nPlease respond with valid JSON only.`
            }
          ]
        })
      });
  
      const data = await response.json();
      return JSON.parse(data.content[0].text);
    }
  
    // Google Gemini Integration
    async generateWithGemini(prompt) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\nRespond with valid JSON only.`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000
          }
        })
      });
  
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    }
  
    // Cohere Integration
    async generateWithCohere(prompt) {
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'command',
          prompt: `${prompt}\n\nGenerate a JSON response:`,
          max_tokens: 2000,
          temperature: 0.8
        })
      });
  
      const data = await response.json();
      return JSON.parse(data.generations[0].text);
    }
  
    // Build comprehensive prompt for AI
    buildPrompt(preferences) {
      const {
        categories,
        difficulty,
        timeframe,
        userLevel,
        completedChallenges,
        interests
      } = preferences;
  
      return `Generate personalized life improvement challenges based on these preferences:
  
  Categories: ${categories.join(', ')}
  Difficulty: ${difficulty}
  Timeframe: ${timeframe}
  User Level: ${userLevel}
  Completed Challenges: ${completedChallenges.length}
  Interests: ${interests.join(', ')}
  
  Create a JSON object with this exact structure:
  {
    "active": [
      {
        "id": "unique-id",
        "title": "Challenge Title",
        "description": "Detailed description of what the user will do",
        "category": "health|career|relationships|environment|learning|creativity",
        "status": "active",
        "startTime": timestamp,
        "endTime": timestamp,
        "participants": number,
        "maxScore": number,
        "difficulty": "Beginner|Intermediate|Advanced",
        "requirements": "What the user needs to participate",
        "rewards": "What the user will gain",
        "submissionType": "quiz|timed-quiz|document|text|image|video|url|file",
        "timeLimit": number_in_minutes_if_timed,
        "questions": [
          {
            "text": "Question text",
            "type": "multiple-choice|code|text",
            "options": ["option1", "option2", "option3", "option4"],
            "multiple": false,
            "codeSnippet": "code example if applicable"
          }
        ]
      }
    ],
    "upcoming": [...],
    "completed": [...]
  }
  
  Generate 3 active, 2 upcoming, and 2 completed challenges. Make them engaging, personalized, and achievable. Include diverse submission types and ensure questions are relevant to each challenge.`;
    }
  
    // Format and validate AI response
    formatChallenges(challenges) {
      const now = Date.now();
      
      // Add realistic timestamps and participant counts
      challenges.active?.forEach(challenge => {
        challenge.startTime = now - Math.random() * 7 * 24 * 60 * 60 * 1000; // Started within last week
        challenge.endTime = now + Math.random() * 14 * 24 * 60 * 60 * 1000; // Ends within next 2 weeks
        challenge.participants = Math.floor(Math.random() * 2000) + 100;
      });
  
      challenges.upcoming?.forEach(challenge => {
        challenge.startTime = now + Math.random() * 7 * 24 * 60 * 60 * 1000; // Starts within next week
        challenge.endTime = challenge.startTime + Math.random() * 21 * 24 * 60 * 60 * 1000; // Lasts up to 3 weeks
        challenge.participants = 0;
      });
  
      challenges.completed?.forEach(challenge => {
        challenge.endTime = now - Math.random() * 30 * 24 * 60 * 60 * 1000; // Ended within last month
        challenge.startTime = challenge.endTime - Math.random() * 21 * 24 * 60 * 60 * 1000; // Lasted up to 3 weeks
        challenge.participants = Math.floor(Math.random() * 5000) + 500;
      });
  
      return challenges;
    }
  
    // Fallback challenges if AI fails
    getFallbackChallenges() {
      return {
        active: [
          {
            id: 'fallback-1',
            title: 'Daily Mindfulness Practice',
            description: 'Practice 10 minutes of mindfulness meditation each day for a week.',
            category: 'health',
            status: 'active',
            startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
            participants: 1234,
            maxScore: 300,
            difficulty: 'Beginner',
            requirements: 'Quiet space, 10 minutes daily',
            rewards: 'Reduced stress, better focus',
            submissionType: 'text'
          }
        ],
        upcoming: [],
        completed: []
      };
    }
  
    // Get authentication token (implement based on your auth system)
    getAuthToken() {
      return localStorage.getItem('authToken') || '';
    }
  
    // Real-time challenge updates via WebSocket
    subscribeToUpdates(callback) {
      const ws = new WebSocket(`${this.backendUrl.replace('http', 'ws')}/challenges`);
      
      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        callback(update);
      };
  
      return () => ws.close();
    }
  
    // Submit challenge completion
    async submitChallenge(challengeId, submission) {
      try {
        const response = await fetch(`${this.backendUrl}/api/challenges/${challengeId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(submission)
        });
  
        return await response.json();
      } catch (error) {
        console.error('Submission failed:', error);
        throw error;
      }
    }
  
    // Get user progress and stats
    async getUserStats() {
      try {
        const response = await fetch(`${this.backendUrl}/api/user/stats`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
  
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        return {
          level: 1,
          currentXp: 0,
          nextLevelXp: 1000,
          totalChallenges: 0,
          completedChallenges: 0,
          streak: 0
        };
      }
    }
  }
  
  export default new AIChallengeService();