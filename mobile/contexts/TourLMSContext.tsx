import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { Platform, Alert } from 'react-native';
import { BASE_API_URL, SOCKET_URL } from './config'; // You'll need to configure these

// Enhanced User Interface
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  preferences?: {
    language: string;
    notificationEnabled: boolean;
  };
}

// Course Interfaces
interface Course {
  _id: string;
  id: string;
  title: string;
  category?: string;
  thumbnail?: string;
  progress?: number;
  nextModule?: string;
  facilitatorName?: string;
  instructor?: string;
  totalLessons?: number;
  completedLessons?: number;
  totalQuizzes?: number;
  completedQuizzes?: number;
  averageScore?: number;
  points?: number;
  xp?: number;
  completed?: boolean;
  certificateIssued?: boolean;
  lastAccessedAt?: string;
  lastAccessed?: Date;
  shortDescription?: string;
  description?: string;
  enrollment?: {
    moduleProgress?: Array<{
      contentProgress?: Array<{
        contentId: string;
        lastAccessedAt?: string;
        completed?: boolean;
      }>;
    }>;
  };
}

interface UserStats {
  totalPoints: number;
  rank: number;
  completedCourses: number;
  activeCourses: number;
  currentStreak: number;
  totalXp: number;
  totalEnrolled: number;
  certificatesEarned: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lastActive: string;
  streakDays: number;
  inProgressCourses: number;
  totalHoursLearned: number;
  achievements: string[];
}

interface Activity {
  _id: string;
  id: string;
  courseId: string;
  courseTitle: string;
  contentId: string;
  contentTitle: string;
  type: 'lesson' | 'quiz' | 'assignment';
  action: 'completed' | 'started' | 'submitted';
  createdAt: string;
  updatedAt: string;
  date: Date;
  metadata?: any;
}

interface UserXP {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: {
    current: number;
    longest: number;
    lastUpdated: string;
  };
}

// Context Interface
interface TourLMSContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth functions
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  
  // Course data
  enrolledCourses: Course[];
  CoursesHub: Course[];
  
  // User data
  userXP: UserXP | null;
  
  // Data fetching functions
  fetchEnrolledCourses: () => Promise<Course[]>;
  fetchUserStats: () => Promise<UserStats>;
  fetchRecentActivities: () => Promise<Activity[]>;
  fetchRecommendedCourses: () => Promise<Course[]>;
  fetchUserXP: () => Promise<UserXP>;
  refreshDashboard: () => Promise<void>;
  
  // Socket
  socket: Socket | null;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

// Create Context
const TourLMSContext = createContext<TourLMSContextType | undefined>(undefined);

// Provider Component
export const TourLMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [CoursesHub, setCoursesHub] = useState<Course[]>([]);
  const [userXP, setUserXP] = useState<UserXP | null>(null);

  // Load user/token from AsyncStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          initializeSocket(storedToken);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Initialize socket connection
  const initializeSocket = (authToken: string) => {
    if (socket) {
      socket.disconnect();
    }
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: authToken
      },
      query: {
        platform: Platform.OS
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    setSocket(newSocket);
  };

  // Login
  const login = async (userData: User, authToken: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(userData)),
        AsyncStorage.setItem('token', authToken),
      ]);
      setUser(userData);
      setToken(authToken);
      initializeSocket(authToken);
    } catch (error) {
      console.error('Error storing login data:', error);
      setError('Failed to save login data');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('token'),
      ]);
      if (socket) {
        socket.disconnect();
      }
      setUser(null);
      setToken(null);
      setSocket(null);
      setEnrolledCourses([]);
      setCoursesHub([]);
      setUserXP(null);
    } catch (error) {
      console.error('Error clearing login data:', error);
      setError('Failed to logout');
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      throw error;
    }
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      setError(error instanceof Error ? error.message : 'API request failed');
      throw error;
    }
  };

  // Feature functions with actual API calls
  const fetchEnrolledCourses = async (): Promise<Course[]> => {
    try {
      const data = await apiCall('/courses/enrolled');
      const courses = data.courses || [];
      setEnrolledCourses(courses);
      return courses;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }
  };

  const fetchUserStats = async (): Promise<UserStats> => {
    try {
      return await apiCall('/users/stats');
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  };

  const fetchRecentActivities = async (): Promise<Activity[]> => {
    try {
      const data = await apiCall('/activities/recent');
      return data.activities.map((act: any) => ({
        ...act,
        date: new Date(act.date || act.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  };

  const fetchRecommendedCourses = async (): Promise<Course[]> => {
    try {
      const data = await apiCall('/courses/recommended');
      const courses = data.courses || [];
      setCoursesHub(courses);
      return courses;
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      throw error;
    }
  };

  const fetchUserXP = async (): Promise<UserXP> => {
    try {
      const data = await apiCall('/users/xp');
      setUserXP(data);
      return data;
    } catch (error) {
      console.error('Error fetching user XP:', error);
      throw error;
    }
  };

  const refreshDashboard = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchEnrolledCourses(),
        fetchUserStats(),
        fetchRecentActivities(),
        fetchRecommendedCourses(),
        fetchUserXP(),
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Memoized context value
  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUserProfile,
    enrolledCourses,
    CoursesHub,
    userXP,
    fetchEnrolledCourses,
    fetchUserStats,
    fetchRecentActivities,
    fetchRecommendedCourses,
    fetchUserXP,
    refreshDashboard,
    socket,
    error,
    clearError,
  }), [user, token, isLoading, socket, error, enrolledCourses, CoursesHub, userXP]);

  return (
    <TourLMSContext.Provider value={contextValue}>
      {children}
    </TourLMSContext.Provider>
  );
};

// Custom hook with additional checks
export const useTourLMS = () => {
  const context = useContext(TourLMSContext);
  if (context === undefined) {
    throw new Error('useTourLMS must be used within a TourLMSProvider');
  }
  return context;
};

// Helper hook for authentication status
export const useAuth = () => {
  const { isAuthenticated, isLoading } = useTourLMS();
  return { isAuthenticated, isLoading };
};