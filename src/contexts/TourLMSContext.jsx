import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { clg, ocn } from '../lib/basic';
import { io } from 'socket.io-client';
import notificationService from '../services/notificationService';

// Required env: VITE_API_URL, VITE_SOCKET_URL
const API_URL = import.meta.env.VITE_API_URL || 'https://africanapi.onrender.com/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://africanapi.onrender.com';
// const API_URL = 'http://localhost:3031/api';
const clientID='NOTIFICATION-CLIENT-ID'

const TourLMSContext = createContext(null);

export const useTourLMS = () => {
  const context = useContext(TourLMSContext);
  if (!context) {
    throw new Error('useTourLMS must be used within a TourLMSProvider');
  }
  return context;
};

let ison = false;

const Categories = 'Digital Infrastructure,AI Talent & Education,Innovation & Entrepreneurship,Ethical & Regulatory Frameworks,AI for Key Sectors,Global Collaboration,Inclusivity & Digital Divide'.split(',');

export const TourLMSProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facilitatorCourses, setFacilitatorCourses] = useState([]);
  const [coursesLoaded,setCoursesLoaded] = useState(false)
  const [CoursesHub, setCoursesHub] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [facilitatorStats, setFacilitatorStats] = useState(null);
  const [facilitatorStudents, setFacilitatorStudents] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        if (token) {
          config.headers['x-auth-token'] = token;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Auto logout if 401 response returned from api
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        if (token) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: { 'x-auth-token': token }
            });
            
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            
          } else {
            // Token exists but no user data, try to fetch user info
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: { 'x-auth-token': token }
            });
            
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Token might be invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setIsAuthenticated(false);
        setError('Authentication session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  useEffect(()=>{
    console.log('🔍 [TourLMSContext] Initial useEffect triggered');
    console.log('🔍 [TourLMSContext] ison value:', ison);
    if(ison) {
      console.log('🔍 [TourLMSContext] Already loaded, skipping packLoad');
      return;
    }
    console.log('🔍 [TourLMSContext] Setting ison to true and calling packLoad');
    ison=true;
    packLoad('','');
  },[])

  // Load facilitator dashboard stats when user is logged in as facilitator
  useEffect(() => {
    if (isAuthenticated && user?.role === 'facilitator') {
      loadFacilitatorStats();
      loadFacilitatorStudents();
    }
    // if(user&&(user.role === 'student' || user.role === 'learner')&&token&&!ocn(CoursesHub)){
    //   clg('calling courses for student',user)
    //   packLoad(user,token)
    // }
  }, [isAuthenticated, user,token]);

  // Connect to socket.io when authenticated
  useEffect(() => {
    let socketConnection = null;
    
    if (token) {
      // Initialize socket connection
      const socketURL = SOCKET_URL;
      
      socketConnection = io(socketURL, {
        path: '/socket.io',
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketConnection.on('connect', () => {
        console.log('Socket connected:', socketConnection.id);
      });

      socketConnection.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
      
      // Set up notification handling
      socketConnection.on('notification', (notificationData) => {
        // Add to notifications list
        setNotifications(prev => [notificationData, ...prev]);
        
        // Increment unread count
        setUnreadNotificationsCount(prev => prev + 1);
        
        // Display browser notification if available
        if (notificationService.permission === 'granted') {
          notificationService.displayNotification(
            notificationData.title, 
            { 
              body: notificationData.message,
              data: notificationData.data || {}
            }
          );
        }
      });

      setSocket(socketConnection);
      
      // Initialize notification service for browser notifications
      notificationService.initialize().then((initialized) => {
        if (initialized && notificationService.permission === 'granted') {
          // Register the subscription with the server
          notificationService.registerWithServer(token);
        }
      });
      
      // Load notifications
      loadNotifications();
    }

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [token]);

  const configureAxios = (tok) => {
    if (tok) {
      axios.defaults.headers.common['x-auth-token'] = tok;
    }
  };
 
  const getMe = async (tok) => {
    configureAxios(tok);
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  const loadFacilitatorStats = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/facilitator/dashboard`, {
        headers: { 'x-auth-token': token }
      });
      setFacilitatorStats(response.data);
    } catch (error) {
      console.error('Error loading facilitator stats:', error);
    }
  };

  const loadFacilitatorStudents = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/facilitator/students`, {
        headers: { 'x-auth-token': token }
      });
      setFacilitatorStudents(response.data);
    } catch (error) {
      console.error('Error loading facilitator students:', error);
    }
  };

  const loadNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { 'x-auth-token': token }
      });
      
      setNotifications(response.data);
      
      // Count unread notifications
      const unreadCount = response.data.filter(notification => !notification.read).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true, readAt: new Date() }
          : notification
      ));
      
      // Decrement unread count
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!token) return;
    
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        read: true,
        readAt: new Date()
      })));
      
      // Reset unread count
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
    
  async function packLoad(newUser, tok) {
    console.log('🔍 [TourLMSContext] packLoad called');
    console.log('🔍 [TourLMSContext] newUser:', newUser);
    console.log('🔍 [TourLMSContext] token exists:', !!tok);
    
    try {
      // Load courses based on user role
      if (newUser?.role === 'facilitator') {
        console.log('🔍 [TourLMSContext] Loading facilitator courses...');
        // Load facilitator courses
        const facilitatorResponse = await axios.get(`${API_URL}/facilitator/courses`, {
          headers: { 'x-auth-token': tok }
        });
        console.log('🔍 [TourLMSContext] Facilitator courses response:', facilitatorResponse.data);
        setFacilitatorCourses(facilitatorResponse.data);
        setCoursesLoaded(true)
        // Load facilitator stats and students
        await loadFacilitatorStats();
        await loadFacilitatorStudents();
      }
      if (newUser?.role === 'student' || newUser?.role === 'learner') {
        console.log('🔍 [TourLMSContext] Loading learner courses...');
        clg('checking leaners courses')
        const learnerResponse = await axios.get(`${API_URL}/students/courses`, {
          headers: { 'x-auth-token': tok }
        });
        console.log('🔍 [TourLMSContext] Learner courses response:', learnerResponse.data);
        await setEnrolledCourses(learnerResponse.data);
      }
      
      // For both students and facilitators, load all courses
      console.log('🔍 [TourLMSContext] Loading all courses...');
      const allCoursesResponse = await axios.get(`${API_URL}/courses`, {
        headers: { 'x-auth-token': tok }
      });
      console.log('🔍 [TourLMSContext] All courses response length:', allCoursesResponse.data?.length);
      if (allCoursesResponse.data && allCoursesResponse.data.length > 0) {
        console.log('🔍 [TourLMSContext] First course sample:', {
          courseId: allCoursesResponse.data[0].courseId,
          _id: allCoursesResponse.data[0]._id,
          title: allCoursesResponse.data[0].title,
          keys: Object.keys(allCoursesResponse.data[0])
        });
        console.log('🔍 [TourLMSContext] All courseIds:', allCoursesResponse.data.map(c => c.courseId));
        console.log('🔍 [TourLMSContext] All _ids:', allCoursesResponse.data.map(c => c._id));
      }
      console.log('🔍 [TourLMSContext] Setting CoursesHub...');
      setCoursesHub(allCoursesResponse.data);
      
      // For students, also get enrolled courses
      
    } catch (error) {
      console.error('❌ [TourLMSContext] Error in packLoad:', error);
      console.error('❌ [TourLMSContext] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  }
  
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = (userData.token)?'':await axios.post(`${API_URL}/auth/register`, userData);
      const { token: newToken, user: newUser } = (userData.token)?userData:response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      await setToken(newToken);
      await setUser(newUser);
      await setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = (credentials.token)?'':await axios.post(`${API_URL}/auth/login`, credentials);
      const { token: newToken, user: newUser } = credentials.token?credentials:response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      packLoad(newUser, newToken);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setFacilitatorCourses([]);
    setCoursesHub([]);
    setEnrolledCourses([]);
    setFacilitatorStats(null);
    setFacilitatorStudents([]);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const clearError = () => setError(null);

  const value = {
    isAuthenticated,coursesLoaded,
    facilitatorCourses,clientID,
    setFacilitatorCourses,
    user,theme,setTheme,
    setUser,
    packLoad,
    token,API_URL,
    setToken,
    loading,
    error,
    CoursesHub,
    setCoursesHub,
    enrolledCourses,
    setEnrolledCourses,
    facilitatorStats,
    facilitatorStudents,
    register,
    login,
    Categories,
    logout,
    clearError,
    loadFacilitatorStats,
    loadFacilitatorStudents,
    socket,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    loadNotifications
  };

  return <TourLMSContext.Provider value={value}>{children}</TourLMSContext.Provider>;
};
