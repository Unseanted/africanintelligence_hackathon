import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-url.com/api';

// Type definitions
interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: "student" | "facilitator" | "admin" | "learner";
  avatar: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
  };
}

interface Course {
  id: string;
  _id: string;
  title: string;
  description: string;
  facilitatorName: string;
  thumbnail: string;
  category: string;
  progress: number;
  nextModule: string;
}

interface Activity {
  id: string;
  courseId: string;
  courseTitle: string;
  contentId: string;
  contentTitle: string;
  type: "lesson" | "quiz" | "assignment";
  action: "completed" | "started" | "submitted";
  createdAt: string;
}

interface XPData {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  achievements: Achievement[];
  badges: Badge[];
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface TourLMSContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  enrolledCourses: Course[];
  CoursesHub: Course[];
  facilitatorCourses: Course[];
  coursesLoaded: boolean;
  userXP: XPData | null;
  xpLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  getCoursesHub: () => Promise<void>;
  packLoad: (user: User | null, token: string | null) => Promise<void>;
  updateUserPreferences: (preferences: {
    notifications?: boolean;
    darkMode?: boolean;
  }) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  awardXP: (amount: number, reason: string) => Promise<void>;
  fetchUserXP: () => Promise<void>;
  calculateLevel: (totalXP: number) => {
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
  };
  fetchEnrolledCourses: () => Promise<Course[]>;
  fetchUserStats: () => Promise<void>;
  fetchRecentActivities: () => Promise<void>;
  fetchRecommendedCourses: () => Promise<Course[]>;
  refreshDashboard: () => Promise<void>;
}

const TourLMSContext = createContext<TourLMSContextType | undefined>(undefined);

// API Service Class
class APIService {
  private static instance: APIService;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_BASE_URL;
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await AsyncStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async forgotPassword(email: string): Promise<void> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Course endpoints
  async getCourses(): Promise<Course[]> {
    return this.request('/courses');
  }

  async getEnrolledCourses(): Promise<Course[]> {
    return this.request('/courses/enrolled');
  }

  async getFacilitatorCourses(): Promise<Course[]> {
    return this.request('/courses/facilitator');
  }

  async enrollInCourse(courseId: string): Promise<void> {
    return this.request(`/courses/${courseId}/enroll`, { method: 'POST' });
  }

  async getRecommendedCourses(): Promise<Course[]> {
    return this.request('/courses/recommended');
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    return this.request('/user/profile');
  }

  async updateUserPreferences(preferences: {
    notifications?: boolean;
    darkMode?: boolean;
  }): Promise<User> {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // XP and gamification endpoints
  async getUserXP(): Promise<XPData> {
    return this.request('/user/xp');
  }

  async awardXP(amount: number, reason: string): Promise<XPData> {
    return this.request('/user/xp/award', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  async getUserStats(): Promise<any> {
    return this.request('/user/stats');
  }

  async getRecentActivities(): Promise<Activity[]> {
    return this.request('/user/activities');
  }
}

export function TourLMSProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    token: null as string | null,
    loading: false,
    enrolledCourses: [] as Course[],
    CoursesHub: [] as Course[],
    facilitatorCourses: [] as Course[],
    coursesLoaded: false,
    userXP: null as XPData | null,
    xpLoading: false,
  });

  const apiService = APIService.getInstance();

  // Initialize app by checking for stored token
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        setState(prev => ({ ...prev, user, token: storedToken }));
        await packLoad(user, storedToken);
      }
    } catch (error) {
      console.error('App initialization error:', error);
      // Clear invalid stored data
      await AsyncStorage.multiRemove(['authToken', 'userData']);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const calculateLevel = useMemo(
    () => (totalXP: number) => {
      let level = 1;
      let xpForCurrentLevel = 0;
      let xpForNextLevel = 100;

      while (totalXP >= xpForNextLevel) {
        xpForCurrentLevel = xpForNextLevel;
        level++;
        xpForNextLevel = xpForCurrentLevel + level * 100 + (level - 1) * 50;
      }

      return {
        level,
        currentLevelXP: totalXP - xpForCurrentLevel,
        nextLevelXP: xpForNextLevel - xpForCurrentLevel,
      };
    },
    []
  );

  const fetchUserXP = useCallback(async () => {
    if (!state.user || !state.token) return;
    
    try {
      setState(prev => ({ ...prev, xpLoading: true }));
      const xpData = await apiService.getUserXP();
      setState(prev => ({ ...prev, userXP: xpData }));
    } catch (error) {
      console.error('Error fetching user XP:', error);
    } finally {
      setState(prev => ({ ...prev, xpLoading: false }));
    }
  }, [state.user, state.token]);

  const awardXP = async (amount: number, reason: string) => {
    if (!state.user || !state.token) return;
    
    try {
      const updatedXP = await apiService.awardXP(amount, reason);
      setState(prev => ({ ...prev, userXP: updatedXP }));
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const packLoad = async (user: User | null, token: string | null) => {
    if (!user || !token) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Load user-specific data based on role
      const promises = [
        fetchUserXP(),
        getCoursesHub(),
      ];

      if (user.role === 'student' || user.role === 'learner') {
        promises.push(fetchEnrolledCourses().then(() => {}));
      }

      if (user.role === 'facilitator') {
        promises.push(fetchFacilitatorCourses());
      }

      await Promise.all(promises);
      setState(prev => ({ ...prev, coursesLoaded: true }));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getCoursesHub = async () => {
    try {
      const courses = await apiService.getCourses();
      setState(prev => ({ ...prev, CoursesHub: courses }));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEnrolledCourses = async (): Promise<Course[]> => {
    if (!state.user || !state.token) return [];
    
    try {
      const courses = await apiService.getEnrolledCourses();
      setState(prev => ({ ...prev, enrolledCourses: courses }));
      return courses;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return [];
    }
  };

  const fetchFacilitatorCourses = async () => {
    if (!state.user || !state.token) return;
    
    try {
      const courses = await apiService.getFacilitatorCourses();
      setState(prev => ({ ...prev, facilitatorCourses: courses }));
    } catch (error) {
      console.error('Error fetching facilitator courses:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { user, token } = await apiService.login(email, password);
      
      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      setState(prev => ({ ...prev, user, token }));
      await packLoad(user, token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { user, token } = await apiService.register(userData);
      
      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      setState(prev => ({ ...prev, user, token }));
      await packLoad(user, token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      setState({
        user: null,
        token: null,
        loading: false,
        enrolledCourses: [],
        CoursesHub: [],
        facilitatorCourses: [],
        coursesLoaded: false,
        userXP: null,
        xpLoading: false,
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await apiService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const updateUserPreferences = async (preferences: {
    notifications?: boolean;
    darkMode?: boolean;
  }) => {
    if (!state.user || !state.token) return;
    
    try {
      const updatedUser = await apiService.updateUserPreferences(preferences);
      setState(prev => ({ ...prev, user: updatedUser }));
      
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!state.user || !state.token) return;
    
    try {
      await apiService.enrollInCourse(courseId);
      
      // Refresh enrolled courses
      await fetchEnrolledCourses();
      
      // Award XP for enrollment
      await awardXP(50, 'Course enrollment');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  };

  const fetchUserStats = async () => {
    if (!state.user || !state.token) return;
    
    try {
      const stats = await apiService.getUserStats();
      console.log('User Stats:', stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    if (!state.user || !state.token) return;
    
    try {
      const activities = await apiService.getRecentActivities();
      console.log('Recent Activities:', activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchRecommendedCourses = async (): Promise<Course[]> => {
    if (!state.user || !state.token) return [];
    
    try {
      return await apiService.getRecommendedCourses();
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      return [];
    }
  };

  const refreshDashboard = async () => {
    if (!state.user || !state.token) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await Promise.all([
        fetchUserXP(),
        fetchEnrolledCourses(),
        fetchUserStats(),
        fetchRecentActivities(),
        fetchRecommendedCourses(),
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      forgotPassword,
      getCoursesHub,
      packLoad,
      updateUserPreferences,
      enrollInCourse,
      awardXP,
      fetchUserXP,
      calculateLevel,
      fetchEnrolledCourses,
      fetchUserStats,
      fetchRecentActivities,
      fetchRecommendedCourses,
      refreshDashboard,
    }),
    [state, fetchUserXP]
  );

  return (
    <TourLMSContext.Provider value={value}>{children}</TourLMSContext.Provider>
  );
}

export function useTourLMS() {
  const context = useContext(TourLMSContext);
  if (context === undefined) {
    throw new Error("useTourLMS must be used within a TourLMSProvider");
  }
  return context;
}

export default TourLMSProvider;