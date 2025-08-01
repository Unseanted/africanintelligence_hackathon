// services/aiChallengeService.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// Type definitions
interface UserPreferences {
  categories: string[];
  difficulty: string;
  interests: string[];
}

interface UserStats {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalChallenges: number;
  completedChallenges: number;
  streak: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'upcoming' | 'completed';
  startTime: number;
  endTime: number;
  participants: number;
  maxScore: number;
  difficulty: string;
  requirements: string;
  rewards: string;
  submissionType: string;
  questions?: Question[];
  aiPowered?: boolean;
}

interface Question {
  text: string;
  options?: string[];
  multiple?: boolean;
  type?: string;
}

interface Submission {
  type: string;
  answers?: Record<number, string | string[]>;
  text?: string;
  submittedAt: number;
  timeSpent?: number;
}

interface SubmissionResult {
  xpEarned: number;
  success: boolean;
  message?: string;
}

interface ChallengeProgress {
  progress: number;
  completed: boolean;
  lastActivity: number;
}

interface CommunityStats {
  participants: number;
  averageScore: number;
  completionRate: number;
}

interface Feedback {
  score: number;
  comments: string;
  suggestions: string[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
}

// API Error interface for better error handling
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'https://your-production-api.com/api'
});

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor with proper typing
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // You can add authentication tokens here if needed
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    // Handle common API errors here
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.message,
        code: error.code,
        status: error.response?.status
      };
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  }
);

// Helper function for error logging (to satisfy ESLint)
const logError = (context: string, error: unknown): void => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`${context}:`, error);
  }
};

const aiChallengeService = {
  /**
   * Get AI-generated challenges based on user preferences
   * @param preferences - User preferences for challenge generation
   * @param stats - User statistics and progress
   * @returns Array of generated challenges
   */
  async generateChallenges(preferences: UserPreferences, stats: UserStats): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<{ challenges: Challenge[] }> = await api.post('/challenges/generate', {
        preferences,
        stats
      });
      return response.data.challenges;
    } catch (error: unknown) {
      logError('Error generating challenges', error);
      throw error;
    }
  },

  /**
   * Submit a challenge solution
   * @param challengeId - ID of the challenge being submitted
   * @param submission - The challenge submission data
   * @returns Response with XP earned and results
   */
  async submitChallenge(challengeId: string, submission: Submission): Promise<SubmissionResult> {
    try {
      const response: AxiosResponse<SubmissionResult> = await api.post(`/challenges/${challengeId}/submit`, submission);
      return response.data;
    } catch (error: unknown) {
      logError('Error submitting challenge', error);
      throw error;
    }
  },

  /**
   * Join a challenge waitlist
   * @param challengeId - ID of the challenge to join waitlist for
   * @returns Confirmation response
   */
  async joinWaitlist(challengeId: string): Promise<{ success: boolean; position?: number }> {
    try {
      const response: AxiosResponse<{ success: boolean; position?: number }> = await api.post(`/challenges/${challengeId}/waitlist`);
      return response.data;
    } catch (error: unknown) {
      logError('Error joining waitlist', error);
      throw error;
    }
  },

  /**
   * Get user's active challenges
   * @returns Array of active challenges
   */
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<{ challenges: Challenge[] }> = await api.get('/challenges/active');
      return response.data.challenges;
    } catch (error: unknown) {
      logError('Error getting active challenges', error);
      throw error;
    }
  },

  /**
   * Get user's completed challenges
   * @returns Array of completed challenges
   */
  async getCompletedChallenges(): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<{ challenges: Challenge[] }> = await api.get('/challenges/completed');
      return response.data.challenges;
    } catch (error: unknown) {
      logError('Error getting completed challenges', error);
      throw error;
    }
  },

  /**
   * Get upcoming challenges
   * @returns Array of upcoming challenges
   */
  async getUpcomingChallenges(): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<{ challenges: Challenge[] }> = await api.get('/challenges/upcoming');
      return response.data.challenges;
    } catch (error: unknown) {
      logError('Error getting upcoming challenges', error);
      throw error;
    }
  },

  /**
   * Get challenge details by ID
   * @param challengeId - ID of the challenge to fetch
   * @returns Challenge details
   */
  async getChallengeDetails(challengeId: string): Promise<Challenge> {
    try {
      const response: AxiosResponse<{ challenge: Challenge }> = await api.get(`/challenges/${challengeId}`);
      return response.data.challenge;
    } catch (error: unknown) {
      logError('Error getting challenge details', error);
      throw error;
    }
  },

  /**
   * Get user's progress on a specific challenge
   * @param challengeId - ID of the challenge
   * @returns User's progress data
   */
  async getChallengeProgress(challengeId: string): Promise<ChallengeProgress> {
    try {
      const response: AxiosResponse<{ progress: ChallengeProgress }> = await api.get(`/challenges/${challengeId}/progress`);
      return response.data.progress;
    } catch (error: unknown) {
      logError('Error getting challenge progress', error);
      throw error;
    }
  },

  /**
   * Get community stats for a challenge
   * @param challengeId - ID of the challenge
   * @returns Community participation stats
   */
  async getCommunityStats(challengeId: string): Promise<CommunityStats> {
    try {
      const response: AxiosResponse<{ stats: CommunityStats }> = await api.get(`/challenges/${challengeId}/community`);
      return response.data.stats;
    } catch (error: unknown) {
      logError('Error getting community stats', error);
      throw error;
    }
  },

  /**
   * Rate a completed challenge
   * @param challengeId - ID of the challenge
   * @param rating - User rating (1-5)
   * @param feedback - Optional feedback text
   * @returns Confirmation response
   */
  async rateChallenge(challengeId: string, rating: number, feedback = ''): Promise<{ success: boolean }> {
    try {
      const response: AxiosResponse<{ success: boolean }> = await api.post(`/challenges/${challengeId}/rate`, {
        rating,
        feedback
      });
      return response.data;
    } catch (error: unknown) {
      logError('Error rating challenge', error);
      throw error;
    }
  },

  /**
   * Share a challenge with friends
   * @param challengeId - ID of the challenge to share
   * @param recipients - Array of recipient IDs or emails
   * @param message - Personal message to include
   * @returns Sharing confirmation
   */
  async shareChallenge(
    challengeId: string,
    recipients: string[],
    message = ''
  ): Promise<{ success: boolean; sharedCount: number }> {
    try {
      const response: AxiosResponse<{ success: boolean; sharedCount: number }> = await api.post(`/challenges/${challengeId}/share`, {
        recipients,
        message
      });
      return response.data;
    } catch (error: unknown) {
      logError('Error sharing challenge', error);
      throw error;
    }
  },

  /**
   * Get AI-generated feedback on a submission
   * @param submissionId - ID of the submission
   * @returns AI feedback response
   */
  async getSubmissionFeedback(submissionId: string): Promise<Feedback> {
    try {
      const response: AxiosResponse<{ feedback: Feedback }> = await api.get(`/submissions/${submissionId}/feedback`);
      return response.data.feedback;
    } catch (error: unknown) {
      logError('Error getting submission feedback', error);
      throw error;
    }
  },

  /**
   * Get recommended challenges based on user history
   * @returns Array of recommended challenges
   */
  async getRecommendedChallenges(): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<{ challenges: Challenge[] }> = await api.get('/challenges/recommended');
      return response.data.challenges;
    } catch (error: unknown) {
      logError('Error getting recommended challenges', error);
      throw error;
    }
  },

  /**
   * Get challenge leaderboard
   * @param challengeId - ID of the challenge
   * @returns Leaderboard data
   */
  async getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    try {
      const response: AxiosResponse<{ leaderboard: LeaderboardEntry[] }> = await api.get(`/challenges/${challengeId}/leaderboard`);
      return response.data.leaderboard;
    } catch (error: unknown) {
      logError('Error getting leaderboard', error);
      throw error;
    }
  }
};

export default aiChallengeService;
export type {
  UserPreferences,
  UserStats,
  Challenge,
  Question,
  Submission,
  SubmissionResult,
  ChallengeProgress,
  CommunityStats,
  Feedback,
  LeaderboardEntry,
  ApiError
};