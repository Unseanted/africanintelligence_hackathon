import React, { createContext, useContext, useMemo, useState } from "react";

// Fallback values for environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Define SocketState interface
interface SocketState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  enrolledCourses: Course[];
  availableCourses: Course[];
  CoursesHub: Course[]; // Added this
  challenges: Challenge[];
  events: Event[];
  conversations: Conversation[];
  activeConversation: Conversation | null;
  userXP: XPData | null;
  recentActivities: Activity[];
}

// Type definitions
interface User {
  id: string;
  _id?: string;
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
  _id?: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: number;
  progress?: number;
  nextModule?: string;
  category?: string;
  modules?: Module[]; // Added for CourseContent component
  totalStudents?: number; // Added for course meta
}

interface Module {
  id: string;
  title: string;
  duration: number;
  completed?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
}

interface Conversation {
  id: string;
  title: string;
  aiModel: string;
  lastMessage?: any;
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

interface TourLMSContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  enrolledCourses: Course[];
  availableCourses: Course[];
  CoursesHub: Course[]; // Added this
  challenges: Challenge[];
  events: Event[];
  conversations: Conversation[];
  activeConversation: Conversation | null;
  userXP: XPData | null;
  recentActivities: Activity[];
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  fetchAvailableCourses: () => Promise<void>;
  getCoursesHub: () => Promise<void>; // Added this
  enrollInCourse: (courseId: string) => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  createConversation: (title: string, aiModel?: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, message: string, aiModel?: string) => Promise<void>;
  fetchChallenges: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchUserXP: () => Promise<void>;
  awardXP: (amount: number, reason: string) => Promise<void>;
  fetchRecentActivities: () => Promise<void>;
  calculateLevel: (totalXP: number) => {
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
  };
  refreshDashboard: () => Promise<void>;
  updateUserPreferences: (preferences: {
    notifications?: boolean;
    darkMode?: boolean;
  }) => Promise<void>;
}

const TourLMSContext = createContext<TourLMSContextType | undefined>(undefined);

export function TourLMSProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SocketState>({
    user: {
      id: "user-123",
      _id: "user-123",
      name: "Test User",
      email: "test@example.com",
      role: "student",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      preferences: {
        notifications: true,
        darkMode: false
      }
    },
    token: "hardcoded-token-for-testing",
    loading: false,
    error: null,
    enrolledCourses: [
      {
        id: "course-1",
        _id: "course-1",
        title: "Introduction to African History",
        description: "Learn about the rich history of Africa from ancient times to modern day",
        instructor: "Dr. Kwame Nkrumah",
        thumbnail: "https://via.placeholder.com/300x200?text=African+History",
        duration: 30,
        progress: 65,
        nextModule: "The Great Empires",
        category: "History",
        modules: [
          { id: "mod-1", title: "Ancient Civilizations", duration: 45, completed: true },
          { id: "mod-2", title: "The Great Empires", duration: 60, completed: false },
          { id: "mod-3", title: "Colonial Period", duration: 50, completed: false }
        ],
        totalStudents: 125
      },
      {
        id: "course-2",
        _id: "course-2",
        title: "Swahili Language Basics",
        description: "Master the fundamentals of the Swahili language",
        instructor: "Prof. Amina Mohamed",
        thumbnail: "https://via.placeholder.com/300x200?text=Swahili+Language",
        duration: 20,
        progress: 30,
        nextModule: "Greetings and Introductions",
        category: "Language",
        modules: [
          { id: "mod-1", title: "Alphabet and Pronunciation", duration: 30, completed: true },
          { id: "mod-2", title: "Greetings and Introductions", duration: 45, completed: false },
          { id: "mod-3", title: "Common Phrases", duration: 40, completed: false }
        ],
        totalStudents: 89
      }
    ],
    availableCourses: [
      {
        id: "course-3",
        _id: "course-3",
        title: "African Art and Culture",
        description: "Explore the diverse artistic traditions across Africa",
        instructor: "Dr. Yaa Asantewaa",
        thumbnail: "https://via.placeholder.com/300x200?text=African+Art",
        duration: 25,
        category: "Arts",
        modules: [
          { id: "mod-1", title: "Traditional Art Forms", duration: 40 },
          { id: "mod-2", title: "Contemporary African Art", duration: 35 },
          { id: "mod-3", title: "Cultural Significance", duration: 45 }
        ],
        totalStudents: 72
      },
      {
        id: "course-4",
        _id: "course-4",
        title: "African Wildlife Conservation",
        description: "Learn about Africa's unique wildlife and conservation efforts",
        instructor: "Dr. Jane Goodall",
        thumbnail: "https://via.placeholder.com/300x200?text=Wildlife",
        duration: 15,
        category: "Science",
        modules: [
          { id: "mod-1", title: "Big Five Animals", duration: 30 },
          { id: "mod-2", title: "Ecosystems", duration: 40 },
          { id: "mod-3", title: "Conservation Challenges", duration: 35 }
        ],
        totalStudents: 104
      },
      {
        id: "course-5",
        _id: "course-5",
        title: "African Cuisine Masterclass",
        description: "Cook delicious traditional dishes from across Africa",
        instructor: "Chef Pierre Thiam",
        thumbnail: "https://via.placeholder.com/300x200?text=African+Cuisine",
        duration: 10,
        category: "Cooking",
        modules: [
          { id: "mod-1", title: "West African Dishes", duration: 25 },
          { id: "mod-2", title: "East African Flavors", duration: 30 },
          { id: "mod-3", title: "North African Specialties", duration: 35 }
        ],
        totalStudents: 63
      }
    ],
    CoursesHub: [ // Added this new property
      {
        id: "course-6",
        _id: "course-6",
        title: "African Music and Dance",
        description: "Explore traditional and contemporary African music and dance forms",
        instructor: "Dr. Fela Kuti",
        thumbnail: "https://via.placeholder.com/300x200?text=African+Music",
        duration: 20,
        category: "Arts",
        modules: [
          { id: "mod-1", title: "Traditional Rhythms", duration: 35 },
          { id: "mod-2", title: "Modern African Music", duration: 40 },
          { id: "mod-3", title: "Dance Techniques", duration: 45 }
        ],
        totalStudents: 58
      },
      {
        id: "course-7",
        _id: "course-7",
        title: "African Literature",
        description: "Study the rich literary traditions of Africa",
        instructor: "Prof. Chinua Achebe",
        thumbnail: "https://via.placeholder.com/300x200?text=African+Literature",
        duration: 30,
        category: "Literature",
        modules: [
          { id: "mod-1", title: "Oral Traditions", duration: 40 },
          { id: "mod-2", title: "Post-Colonial Literature", duration: 50 },
          { id: "mod-3", title: "Contemporary Writers", duration: 45 }
        ],
        totalStudents: 47
      },
      {
        id: "course-8",
        _id: "course-8",
        title: "African Geography",
        description: "Learn about the diverse landscapes and ecosystems of Africa",
        instructor: "Dr. Wangari Maathai",
        thumbnail: "https://via.placeholder.com/300x200?text=African+Geography",
        duration: 25,
        category: "Geography",
        modules: [
          { id: "mod-1", title: "Physical Features", duration: 35 },
          { id: "mod-2", title: "Climate Zones", duration: 40 },
          { id: "mod-3", title: "Natural Resources", duration: 45 }
        ],
        totalStudents: 82
      }
    ],
    challenges: [
      {
        id: "challenge-1",
        title: "History Quiz",
        description: "Test your knowledge of African history",
        difficulty: "medium",
        points: 100
      },
      {
        id: "challenge-2",
        title: "Language Challenge",
        description: "Translate these common phrases",
        difficulty: "easy",
        points: 50
      },
      {
        id: "challenge-3",
        title: "Art Identification",
        description: "Identify these famous African artworks",
        difficulty: "hard",
        points: 200
      }
    ],
    events: [
      {
        id: "event-1",
        title: "African History Symposium",
        description: "Annual gathering of African history scholars",
        startDate: "2023-11-15T09:00:00",
        endDate: "2023-11-17T17:00:00",
        type: "conference"
      },
      {
        id: "event-2",
        title: "Swahili Conversation Club",
        description: "Practice your Swahili with native speakers",
        startDate: "2023-11-20T18:00:00",
        endDate: "2023-11-20T19:30:00",
        type: "workshop"
      },
      {
        id: "event-3",
        title: "African Art Exhibition",
        description: "Showcase of contemporary African artists",
        startDate: "2023-12-01T10:00:00",
        endDate: "2023-12-31T18:00:00",
        type: "exhibition"
      }
    ],
    conversations: [
      {
        id: "conv-1",
        title: "History Questions",
        aiModel: "mistral-large-latest",
        lastMessage: {
          content: "The Mali Empire was one of the most powerful empires in West Africa",
          timestamp: "2023-11-10T14:30:00",
          role: "assistant"
        }
      },
      {
        id: "conv-2",
        title: "Language Help",
        aiModel: "mistral-large-latest",
        lastMessage: {
          content: "Hujambo means hello in Swahili",
          timestamp: "2023-11-08T09:15:00",
          role: "assistant"
        }
      }
    ],
    activeConversation: null,
    userXP: {
      totalXP: 1250,
      level: 5,
      currentLevelXP: 250,
      nextLevelXP: 500,
      achievements: [
        {
          id: "ach-1",
          name: "Fast Learner",
          description: "Completed 5 lessons in one day",
          icon: "🏃‍♂️",
          xpReward: 100,
          unlockedAt: "2023-10-15T16:20:00"
        },
        {
          id: "ach-2",
          name: "History Buff",
          description: "Scored 100% on a history quiz",
          icon: "📜",
          xpReward: 150,
          unlockedAt: "2023-10-20T11:45:00"
        }
      ],
      badges: [
        {
          id: "badge-1",
          name: "Bronze Explorer",
          description: "Completed 10 lessons",
          icon: "🥉",
          earnedAt: "2023-10-10T14:30:00",
          rarity: "common"
        },
        {
          id: "badge-2",
          name: "Silver Scholar",
          description: "Reached level 3",
          icon: "🥈",
          earnedAt: "2023-10-25T09:15:00",
          rarity: "rare"
        }
      ],
      streak: {
        current: 7,
        longest: 12,
        lastActiveDate: "2023-11-10"
      }
    },
    recentActivities: [
      {
        id: "act-1",
        courseId: "course-1",
        courseTitle: "Introduction to African History",
        contentId: "mod-1",
        contentTitle: "Ancient Civilizations",
        type: "lesson",
        action: "completed",
        createdAt: "2023-11-10T14:30:00"
      },
      {
        id: "act-2",
        courseId: "course-2",
        courseTitle: "Swahili Language Basics",
        contentId: "mod-1",
        contentTitle: "Alphabet and Pronunciation",
        type: "lesson",
        action: "started",
        createdAt: "2023-11-09T11:15:00"
      },
      {
        id: "act-3",
        courseId: "course-1",
        courseTitle: "Introduction to African History",
        contentId: "quiz-1",
        contentTitle: "Ancient Civilizations Quiz",
        type: "quiz",
        action: "completed",
        createdAt: "2023-11-08T16:45:00"
      }
    ]
  });

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

  const getCoursesHub = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch from your API
      // const response = await fetch(`${API_URL}/courses/hub`);
      // const data = await response.json();
      // setState(prev => ({ ...prev, CoursesHub: data }));
    } catch (error) {
      setState(prev => ({ ...prev, error: "Failed to fetch courses" }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === "test@example.com" && password === "password123") {
      setState(prev => ({
        ...prev,
        loading: false,
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          role: "student",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
          preferences: {
            notifications: true,
            darkMode: false
          }
        },
        token: "hardcoded-token-for-testing"
      }));
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Invalid credentials"
      }));
      throw new Error("Invalid credentials");
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));

    setState(prev => ({
      ...prev,
      loading: false,
      user: {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name: userData.name,
        email: userData.email,
        role: userData.role as any,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
        preferences: {
          notifications: true,
          darkMode: false
        }
      },
      token: "hardcoded-token-for-testing"
    }));
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      user: null,
      token: null,
      enrolledCourses: [],
      conversations: [],
      activeConversation: null
    }));
  };

  const fetchAvailableCourses = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, loading: false }));
  };

  const enrollInCourse = async (courseId: string) => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));

    // First check CoursesHub, then availableCourses
    let courseToEnroll = state.CoursesHub.find(c => c._id === courseId);
    if (!courseToEnroll) {
      courseToEnroll = state.availableCourses.find(c => c._id === courseId);
    }

    if (courseToEnroll) {
      setState(prev => ({
        ...prev,
        enrolledCourses: [...prev.enrolledCourses, { ...courseToEnroll, progress: 0 }],
        CoursesHub: prev.CoursesHub.filter(c => c._id !== courseId),
        availableCourses: prev.availableCourses.filter(c => c._id !== courseId),
        loading: false,
        userXP: prev.userXP ? {
          ...prev.userXP,
          totalXP: (prev.userXP.totalXP || 0) + 50,
          ...calculateLevel((prev.userXP.totalXP || 0) + 50)
        } : null
      }));
    }
    setState(prev => ({ ...prev, loading: false }));
  };

  const fetchEnrolledCourses = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, loading: false }));
  };

  const createConversation = async (title: string, aiModel: string = "mistral-large-latest") => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 500));

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      aiModel
    };

    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, newConversation],
      activeConversation: newConversation,
      loading: false
    }));

    return newConversation;
  };

  const fetchChallenges = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, loading: false }));
  };

  const fetchEvents = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, loading: false }));
  };

  const fetchUserXP = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, loading: false }));
  };

  const awardXP = async (amount: number, reason: string) => {
    setState(prev => ({
      ...prev,
      userXP: prev.userXP ? {
        ...prev.userXP,
        totalXP: (prev.userXP.totalXP || 0) + amount,
        ...calculateLevel((prev.userXP.totalXP || 0) + amount)
      } : null
    }));
  };

  const fetchRecentActivities = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, loading: false }));
  };

  const sendMessage = async (conversationId: string, message: string, aiModel: string = "mistral-large-latest") => {
    // Update conversation with user message immediately
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
            ...conv,
            lastMessage: {
              content: message,
              timestamp: new Date().toISOString(),
              role: "user"
            }
          }
          : conv
      )
    }));


  
    // Simulate AI response
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId
            ? {
              ...conv,
              lastMessage: {
                content: `This is a mock AI response to: "${message}"`,
                timestamp: new Date().toISOString(),
                role: "assistant"
              }
            }
            : conv
        )
      }));
    }, 1000);
  };
  const refreshDashboard = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await Promise.all([
        getCoursesHub(),
        fetchEnrolledCourses(),
        fetchChallenges(),
        fetchEvents(),
        fetchUserXP(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      setState(prev => ({ ...prev, error: "Failed to refresh dashboard" }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };


  const updateUserPreferences = async (preferences: {
    notifications?: boolean;
    darkMode?: boolean;
  }) => {
    if (!state.user) {
      throw new Error("User not logged in");
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        user: {
          ...prev.user!,
          preferences: {
            ...prev.user!.preferences,
            ...preferences
          }
        },
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: "Failed to update preferences", loading: false }));
      throw error;
    }
  };


  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      fetchAvailableCourses,
      getCoursesHub, // Added this
      enrollInCourse,
      fetchEnrolledCourses,
      createConversation,
      sendMessage,
      fetchChallenges,
      fetchEvents,
      fetchUserXP,
      awardXP,
      fetchRecentActivities,
      calculateLevel,
      refreshDashboard,
      updateUserPreferences,
    }),
    [state, calculateLevel]
  );

  return <TourLMSContext.Provider value={value}>{children}</TourLMSContext.Provider>;
}

export function useTourLMS() {
  const context = useContext(TourLMSContext);
  if (context === undefined) {
    throw new Error("useTourLMS must be used within a TourLMSProvider");
  }
  return context;
}

export default TourLMSProvider;