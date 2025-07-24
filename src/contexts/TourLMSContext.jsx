import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import notificationService from "../services/notificationService";

// Environment configuration
const API_URL =
  import.meta.env.VITE_API_URL || "https://africanapi.onrender.com/api";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://africanapi.onrender.com";
const CLIENT_ID = "NOTIFICATION-CLIENT-ID";
const Categories = [
  "Digital Infrastructure",
  "AI Talent & Education",
  "Innovation & Entrepreneurship",
  "Ethical & Regulatory Frameworks",
  "AI for Key Sectors",
  "Global Collaboration",
  "Inclusivity & Digital Divide",
];

// Context creation
const TourLMSContext = createContext(null);

// Custom hook for context usage
export const useTourLMS = () => {
  const context = useContext(TourLMSContext);
  if (!context) {
    throw new Error("useTourLMS must be used within a TourLMSProvider");
  }
  return context;
};

export const TourLMSProvider = ({ children }) => {
  // State initialization
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facilitatorCourses, setFacilitatorCourses] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [CoursesHub, setCoursesHub] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [facilitatorStats, setFacilitatorStats] = useState(null);
  const [facilitatorStudents, setFacilitatorStudents] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Axios interceptors setup
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers["x-auth-token"] = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
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

  // Authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        if (token) {
          const storedUser = localStorage.getItem("user");
          let userData;

          if (storedUser) {
            userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          }

          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { "x-auth-token": token },
          });

          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
          setIsAuthenticated(true);
        }
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setIsAuthenticated(false);
        setError("Authentication session expired. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  // Initial data load
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      packLoad("", "");
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Load facilitator data
  useEffect(() => {
    if (isAuthenticated && user?.role === "facilitator") {
      loadFacilitatorStats();
      loadFacilitatorStudents();
    }
  }, [isAuthenticated, user]);

  // Socket.io connection setup
  useEffect(() => {
    let socketConnection = null;

    if (token) {
      socketConnection = io(SOCKET_URL, {
        path: "/socket.io",
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketConnection.on("connect", () => {
        setSocket(socketConnection);
      });

      socketConnection.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      socketConnection.on("notification", (notificationData) => {
        setNotifications((prev) => [notificationData, ...prev]);
        setUnreadNotificationsCount((prev) => prev + 1);

        if (notificationService.permission === "granted") {
          notificationService.displayNotification(notificationData.title, {
            body: notificationData.message,
            data: notificationData.data || {},
          });
        }
      });

      notificationService.initialize().then((initialized) => {
        if (initialized && notificationService.permission === "granted") {
          notificationService.registerWithServer(token);
        }
      });

      loadNotifications();
    }

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [token]);

  // Utility functions
  const configureAxios = (tok) => {
    if (tok) {
      axios.defaults.headers.common["x-auth-token"] = tok;
    }
  };

  const getMe = async (tok) => {
    configureAxios(tok);
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  const loadFacilitatorStats = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/facilitator/dashboard`, {
        headers: { "x-auth-token": token },
      });
      setFacilitatorStats(response.data);
    } catch (error) {
      console.error("Error loading facilitator stats:", error);
    }
  };

  const loadFacilitatorStudents = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/facilitator/students`, {
        headers: { "x-auth-token": token },
      });
      setFacilitatorStudents(response.data);
    } catch (error) {
      console.error("Error loading facilitator students:", error);
    }
  };

  const loadNotifications = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { "x-auth-token": token },
      });

      setNotifications(response.data);
      setUnreadNotificationsCount(response.data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!token) return;

    try {
      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );

      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!token) return;

    try {
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        }))
      );

      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const packLoad = async (newUser, tok) => {
    console.log(
      `in packload: ${JSON.stringify(newUser)}, ${JSON.stringify(token)}`
    );
    try {
      if (newUser?.role === "facilitator") {
        const facilitatorResponse = await axios.get(
          `${API_URL}/facilitator/courses`,
          {
            headers: { "x-auth-token": tok },
          }
        );
        setFacilitatorCourses(facilitatorResponse.data);
        setCoursesLoaded(true);
        await Promise.all([loadFacilitatorStats(), loadFacilitatorStudents()]);
      }

      if (newUser?.role === "student") {
        const learnerResponse = await axios.get(
          `${API_URL}/students/me/courses`,
          {
            headers: { "x-auth-token": tok },
          }
        );
        setEnrolledCourses(learnerResponse.data);
      }

      const allCoursesResponse = await axios.get(`${API_URL}/courses`, {
        headers: { "x-auth-token": tok },
      });
      setCoursesHub(allCoursesResponse.data);
    } catch (error) {
      console.error("Error in packLoad:", error);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = userData.token
        ? userData
        : await axios.post(`${API_URL}/auth/register`, userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
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
      if (credentials.token) {
        setToken(credentials.token);
        setUser(credentials.user);
      } else {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        const data = response.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);

      }
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const clearError = () => setError(null);

  // Context value
  const value = {
    isAuthenticated,
    coursesLoaded,
    facilitatorCourses,
    clientID: CLIENT_ID,
    setFacilitatorCourses,
    user,
    theme,
    setTheme,
    setUser,
    packLoad,
    token,
    API_URL,
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
    loadNotifications,
  };

  return (
    <TourLMSContext.Provider value={value}>{children}</TourLMSContext.Provider>
  );
};
