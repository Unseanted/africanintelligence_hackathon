import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TourLMSContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const TourLMSContext = createContext<TourLMSContextType | undefined>(undefined);

export const TourLMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  const login = async (userData: User, authToken: string) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Error storing login data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error clearing login data:', error);
      throw error;
    }
  };

  return (
    <TourLMSContext.Provider value={{ user, token, login, logout }}>
      {children}
    </TourLMSContext.Provider>
  );
};

export const useTourLMS = () => {
  const context = useContext(TourLMSContext);
  if (context === undefined) {
    throw new Error('useTourLMS must be used within a TourLMSProvider');
  }
  return context;
}; 