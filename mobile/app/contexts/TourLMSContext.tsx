import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'facilitator' | 'admin' | 'learner';
  avatar: string;
  preferences?: {
    notifications: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    darkMode: boolean;
  };
}

export interface Course {
  id: string;
  _id: string;
  key?: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: string;
  facilitatorName?: string;
  level: string;
  duration: string;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  overview: string;
  learningObjectives: string[];
  requirements: string[];
  thumbnail: string;
  totalQuizzes: number;
  category?: string;
  points?: number;
  xp?: number;
  completed?: boolean;
  certificateIssued?: boolean;
  completedLessons?: number;
  completedQuizzes?: number;
  averageScore?: number;
  progress?: number;
  lastAccessedAt?: string;
  nextModule?: string;
  enrolledStudents?: string[];
  modules?: any[];
  enrollment?: {
    moduleProgress?: {
      contentProgress?: {
        contentId: string;
        lastAccessedAt: string;
        completed: boolean;
      }[];
    }[];
  };
}

// XP System Types
export interface XPData {
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface TourLMSContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  enrolledCourses: Course[];
  CoursesHub: Course[];
  facilitatorCourses: Course[];
  coursesLoaded: boolean;
  API_URL: string;
  // XP System
  userXP: XPData | null;
  xpLoading: boolean;
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  // Course methods
  getCoursesHub: () => Promise<void>;
  packLoad: (user: User | null, token: string | null) => Promise<void>;
  updateUserPreferences: (preferences: {
    notifications?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    darkMode?: boolean;
  }) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  // XP methods
  awardXP: (amount: number, reason: string) => Promise<void>;
  fetchUserXP: () => Promise<void>;
  calculateLevel: (totalXP: number) => { level: number; currentLevelXP: number; nextLevelXP: number };
  fetchEnrolledCourses: () => Promise<Course[]>;
  fetchUserStats: () => Promise<void>;
  fetchRecentActivities: () => Promise<void>;
  fetchRecommendedCourses: () => Promise<Course[]>;
  refreshDashboard: () => Promise<void>;
  checkAchievements: () => Promise<void>;
  socket: any; 
}

const TourLMSContext = createContext<TourLMSContextType | undefined>(undefined);

export function TourLMSProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    token: null as string | null,
    loading: true,
    enrolledCourses: [] as Course[],
    CoursesHub: [] as Course[],
    facilitatorCourses: [] as Course[],
    coursesLoaded: false,
    userXP: null as XPData | null,
    xpLoading: false
  });

  // XP System Functions
  const calculateLevel = useCallback((totalXP: number) => {
    // Level calculation: Level 1 = 0-99 XP, Level 2 = 100-299 XP, etc.
    // Each level requires more XP: Level n requires n*100 + (n-1)*50 additional XP
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = 100;
    
    while (totalXP >= xpForNextLevel) {
      xpForCurrentLevel = xpForNextLevel;
      level++;
      xpForNextLevel = xpForCurrentLevel + (level * 100) + ((level - 1) * 50);
    }
    
    return {
      level,
      currentLevelXP: totalXP - xpForCurrentLevel,
      nextLevelXP: xpForNextLevel - xpForCurrentLevel
    };
  }, []);

  const fetchUserXP = useCallback(async () => {
    if (!state.token || !state.user) return;
    
    try {
      setState(prev => ({ ...prev, xpLoading: true }));
      
      const response = await fetch(`${API_URL}/user/xp`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const xpData = await response.json();
        const levelData = calculateLevel(xpData.totalXP || 0);
        
        setState(prev => ({
          ...prev,
          userXP: {
            totalXP: xpData.totalXP || 0,
            level: levelData.level,
            currentLevelXP: levelData.currentLevelXP,
            nextLevelXP: levelData.nextLevelXP,
            achievements: xpData.achievements || [],
            badges: xpData.badges || [],
            streak: xpData.streak || {
              current: 0,
              longest: 0,
              lastActiveDate: new Date().toISOString()
            }
          }
        }));
      } else {
        // Initialize default XP data if API doesn't have it
        setState(prev => ({
          ...prev,
          userXP: {
            totalXP: 0,
            level: 1,
            currentLevelXP: 0,
            nextLevelXP: 100,
            achievements: [],
            badges: [],
            streak: {
              current: 0,
              longest: 0,
              lastActiveDate: new Date().toISOString()
            }
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user XP:', error);
      // Initialize default XP data on error
      setState(prev => ({
        ...prev,
        userXP: {
          totalXP: 0,
          level: 1,
          currentLevelXP: 0,
          nextLevelXP: 100,
          achievements: [],
          badges: [],
          streak: {
            current: 0,
            longest: 0,
            lastActiveDate: new Date().toISOString()
          }
        }
      }));
    } finally {
      setState(prev => ({ ...prev, xpLoading: false }));
    }
  }, [state.token, state.user, calculateLevel]);

  const awardXP = useCallback(async (amount: number, reason: string) => {
    if (!state.token || !state.user) return;
    
    try {
      const response = await fetch(`${API_URL}/user/xp/award`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, reason })
      });

      if (response.ok) {
        const newXPData = await response.json();
        const levelData = calculateLevel(newXPData.totalXP);
        
        setState(prev => ({
          ...prev,
          userXP: prev.userXP ? {
            ...prev.userXP,
            totalXP: newXPData.totalXP,
            level: levelData.level,
            currentLevelXP: levelData.currentLevelXP,
            nextLevelXP: levelData.nextLevelXP
          } : null
        }));
        
        // Check for new achievements after XP award
        await checkAchievements();
      } else {
        // If API doesn't support XP yet, update locally
        if (state.userXP) {
          const newTotalXP = state.userXP.totalXP + amount;
          const levelData = calculateLevel(newTotalXP);
          
          setState(prev => ({
            ...prev,
            userXP: prev.userXP ? {
              ...prev.userXP,
              totalXP: newTotalXP,
              level: levelData.level,
              currentLevelXP: levelData.currentLevelXP,
              nextLevelXP: levelData.nextLevelXP
            } : null
          }));
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [state.token, state.user, state.userXP, calculateLevel]);

  const checkAchievements = useCallback(async () => {
    if (!state.token || !state.user || !state.userXP) return;
    
    try {
      const response = await fetch(`${API_URL}/user/achievements/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const achievements = await response.json();
        setState(prev => ({
          ...prev,
          userXP: prev.userXP ? {
            ...prev.userXP,
            achievements: achievements.achievements || prev.userXP.achievements,
            badges: achievements.badges || prev.userXP.badges
          } : null
        }));
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [state.token, state.user, state.userXP]);

  // Original functions with XP integration
  const packLoad = useCallback(async (user: User | null, token: string | null) => {
    if (!token) return;

    try {
      if (user?.role === 'facilitator') {
        const facilitatorResponse = await fetch(`${API_URL}/facilitator/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (facilitatorResponse.ok) {
          const data = await facilitatorResponse.json();
          setState(prev => ({
            ...prev,
            facilitatorCourses: data,
            coursesLoaded: true
          }));
        }
      }

      if (user?.role === 'student' || user?.role === 'learner') {
        const learnerResponse = await fetch(`${API_URL}/learner/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (learnerResponse.ok) {
          const data = await learnerResponse.json();
          setState(prev => ({
            ...prev,
            enrolledCourses: data
          }));
        }
      }

      // Load all courses for both roles
      const allCoursesResponse = await fetch(`${API_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (allCoursesResponse.ok) {
        const data = await allCoursesResponse.json();
        setState(prev => ({
          ...prev,
          CoursesHub: data
        }));
      }

      // Load XP data after loading courses
      await fetchUserXP();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [fetchUserXP]);

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setState(prev => ({
          ...prev,
          token: storedToken,
          user: userData,
          loading: false
        }));
        await packLoad(userData, storedToken);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [packLoad]);

  const getCoursesHub = useCallback(async () => {
    if (!state.token) return;
    
    try {
      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      setState(prev => ({ ...prev, CoursesHub: data }));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, [state.token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      await Promise.all([
        AsyncStorage.setItem('token', data.token),
        AsyncStorage.setItem('user', JSON.stringify(data.user))
      ]);

      setState(prev => ({
        ...prev,
        user: data.user,
        token: data.token
      }));

      await packLoad(data.user, data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [packLoad]);

  const register = useCallback(async (userData: { name: string; email: string; password: string; role: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      await Promise.all([
        AsyncStorage.setItem('token', data.token),
        AsyncStorage.setItem('user', JSON.stringify(data.user))
      ]);

      setState(prev => ({
        ...prev,
        user: data.user,
        token: data.token
      }));

      await packLoad(data.user, data.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [packLoad]);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user')
      ]);
      setState({
        user: null,
        token: null,
        loading: false,
        enrolledCourses: [],
        CoursesHub: [],
        facilitatorCourses: [],
        coursesLoaded: false,
        userXP: null,
        xpLoading: false
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const updateUserPreferences = useCallback(async (preferences: {
    notifications?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    darkMode?: boolean;
  }) => {
    if (!state.user || !state.token) return;
    try {
      const response = await fetch(`${API_URL}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      if (response.ok) {
        const updatedUser = { 
          ...state.user, 
          preferences: { 
            ...state.user?.preferences, 
            ...preferences,
            notifications: preferences.notifications ?? state.user?.preferences?.notifications ?? false,
            darkMode: preferences.darkMode ?? state.user?.preferences?.darkMode ?? false
          } 
        };
        setState(prev => ({
          ...prev,
          user: updatedUser
        }));
      }

      const updatedUser = {
        ...state.user,
        preferences: {
          notifications: state.user.preferences?.notifications ?? true,
          darkMode: state.user.preferences?.darkMode ?? false,
          ...preferences
        }
      };

      setState(prev => ({
        ...prev,
        user: updatedUser
      }));

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, [state.user, state.token]);

  const enrollInCourse = useCallback(async (courseId: string) => {
    if (!state.token) return;
    try {
      const response = await fetch(`${API_URL}/learner/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Enroll error:', errorText);
        throw new Error('Failed to enroll');
      }
      
      // Award XP for enrollment
      await awardXP(50, 'Course enrollment');
      
      await packLoad(state.user, state.token);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }, [state.token, state.user, packLoad, awardXP]);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!state.token || !state.user) return [];
    try {
      const response = await fetch(`${API_URL}/learner/courses`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, enrolledCourses: data }));
        return data;
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
    return [];
  }, [state.token, state.user]);
  
  const fetchUserStats = useCallback(async () => {
    if (!state.token || !state.user) return;
    try {
      const response = await fetch(`${API_URL}/user/stats`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // You can set state if needed
        console.log('User Stats:', data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [state.token, state.user]);
  
  const fetchRecentActivities = useCallback(async () => {
    if (!state.token || !state.user) return;
    try {
      const response = await fetch(`${API_URL}/user/activities`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Update state if necessary
        console.log('Recent Activities:', data);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  }, [state.token, state.user]);
  
  const fetchRecommendedCourses = useCallback(async () => {
    if (!state.token || !state.user) return [];
    try {
      const response = await fetch(`${API_URL}/courses/recommended`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
    }
    return [];
  }, [state.token, state.user]);
  

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchUserXP(),
      fetchEnrolledCourses(),
      fetchUserStats(),
      fetchRecentActivities(),
      fetchRecommendedCourses()
    ]);
  }, [
    fetchUserXP,
    fetchEnrolledCourses,
    fetchUserStats,
    fetchRecentActivities,
    fetchRecommendedCourses
  ]);

  const socket = null;
  

  const value = useMemo(() => ({
    ...state,
    API_URL,
    login,
    register,
    logout,
    getCoursesHub,
    packLoad,
    updateUserPreferences,
    enrollInCourse,
    // XP methods
    awardXP,
    fetchUserXP,
    calculateLevel,
    checkAchievements,
    // ✅ Add these missing properties
    fetchEnrolledCourses,
    fetchUserStats,
    fetchRecentActivities,
    fetchRecommendedCourses,
    refreshDashboard, // ✅ Add this
    socket,
   
  }), [
    state,
    login,
    register,
    logout,
    getCoursesHub,
    packLoad,
    updateUserPreferences,
    enrollInCourse,
    awardXP,
    fetchUserXP,
    calculateLevel,
    checkAchievements,
    fetchEnrolledCourses,
    fetchUserStats,
    fetchRecentActivities,
    fetchRecommendedCourses,
    refreshDashboard, // ✅ Add this
    socket,
  ]);
  return (
    <TourLMSContext.Provider value={value}>
      {children}
    </TourLMSContext.Provider>
  );
}

export function useTourLMS() {
  const context = useContext(TourLMSContext);
  if (context === undefined) {
    throw new Error('useTourLMS must be used within a TourLMSProvider');
  }
  return context;
}

export default TourLMSProvider;