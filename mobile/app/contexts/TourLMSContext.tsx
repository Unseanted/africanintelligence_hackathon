import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'facilitator' | 'admin' | 'learner';
  avatar?: string;
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

interface TourLMSContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  enrolledCourses: Course[];
  CoursesHub: Course[];
  facilitatorCourses: Course[];
  coursesLoaded: boolean;
  API_URL: string;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
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
    coursesLoaded: false
  });

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
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

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
        coursesLoaded: false
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
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
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
      await packLoad(state.user, state.token);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }, [state.token, state.user, packLoad]);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const value = useMemo(() => ({
    user: state.user,
    token: state.token,
    loading: state.loading,
    enrolledCourses: state.enrolledCourses,
    CoursesHub: state.CoursesHub,
    facilitatorCourses: state.facilitatorCourses,
    coursesLoaded: state.coursesLoaded,
    API_URL,
    login,
    register,
    logout,
    getCoursesHub,
    packLoad,
    updateUserPreferences,
    enrollInCourse,
  }), [
    state.user,
    state.token,
    state.loading,
    state.enrolledCourses,
    state.CoursesHub,
    state.facilitatorCourses,
    state.coursesLoaded,
    login,
    register,
    logout,
    getCoursesHub,
    packLoad,
    updateUserPreferences,
    enrollInCourse
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