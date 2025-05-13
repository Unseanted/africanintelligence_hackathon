
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
const configureAxios = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  }
};

// Get user's chats
export const getUserChats = async (token) => {
  configureAxios(token);
  try {
    const response = await axios.get(`${API_URL}/chat`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

// Get chat messages
export const getChatMessages = async (chatId, token) => {
  configureAxios(token);
  try {
    const response = await axios.get(`${API_URL}/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching chat ${chatId} messages:`, error);
    throw error;
  }
};

// Create new chat
export const createChat = async (chatData, token) => {
  configureAxios(token);
  try {
    const response = await axios.post(`${API_URL}/chat`, chatData);
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Send message
export const sendMessage = async (chatId, content, token) => {
  configureAxios(token);
  try {
    const response = await axios.post(`${API_URL}/chat/${chatId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error(`Error sending message to chat ${chatId}:`, error);
    throw error;
  }
};

// Get available users to chat with
export const getAvailableUsers = async (token) => {
  configureAxios(token);
  try {
    const response = await axios.get(`${API_URL}/chat/users/available`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available users:', error);
    throw error;
  }
};
