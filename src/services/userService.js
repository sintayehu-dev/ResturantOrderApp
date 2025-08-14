import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import handleApiError from '../utils/handleApiError';
import authService from './authService';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const USER_API_URL = `${cleanBaseUrl}/users`;

const userService = {
  // Get user profile by ID
  async getUserProfile(userId) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${USER_API_URL}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  async updateUserProfile(userId, userData) {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${USER_API_URL}/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change password
  async changePassword(userId, passwordData) {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${USER_API_URL}/${userId}/password`, passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default userService; 