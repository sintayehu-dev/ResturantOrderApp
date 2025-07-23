import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import handleApiError from '../utils/handleApiError';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const AUTH_API_URL = `${cleanBaseUrl}/users`;

const authService = {
  // Signup user
  async signup(userData) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/signup`, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        user_type: 'ADMIN'
      });

      // Do not store user in localStorage after signup
      // if (response.data) {
      //   localStorage.setItem('user', JSON.stringify({
      //     email: response.data.email,
      //     id: response.data.id,
      //     userId: response.data.user_id
      //   }));
      // }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email,
        password
      });

      if (response.data) {
        // Store the user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    const isAuth = !!user;
    return isAuth;
  },

  // Get auth token
  getToken: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
  },
};

export default authService; 