import axios from 'axios';

const API_URL = 'https://africanapi.onrender.com';

export const getForumCategories = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/forum/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    throw error;
  }
};

export const getCommunityForum = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/forum/community`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching community forum:', error);
    throw error;
  }
};

export const togglePostLike = async (postId: string, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/forum/posts/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
}; 