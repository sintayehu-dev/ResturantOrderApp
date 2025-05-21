import axios from 'axios';

const API_URL = 'http://localhost:9000';

const authService = {
  // Signup user
  async signup(userData) {
    try {
      const response = await axios.post(`${API_URL}/users/signup`, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        user_type: 'ADMIN'
      });

      if (response.data) {
        // Store the user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          email: response.data.email,
          id: response.data.id,
          userId: response.data.user_id
        }));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to sign up';
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });

      if (response.data) {
        // Store the user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to login';
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