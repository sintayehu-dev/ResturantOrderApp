import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import handleApiError from '../utils/handleApiError';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const MENU_API_URL = `${cleanBaseUrl}/menus`;
const BASE_API_URL = cleanBaseUrl; 

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return '';
  }
  try {
    const { token } = JSON.parse(user);
    return token ? `Bearer ${token}` : '';
  } catch (error) {
    return '';
  }
};

// Create axios instance with default config
const menuApi = axios.create({
  baseURL: MENU_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add request interceptor to include auth token
menuApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
menuApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the backend server is running and CORS is enabled.');
    }
    return Promise.reject(error);
  }
);

const menuService = {
  // Get all menus
  getAllMenus: async () => {
    try {
      const response = await menuApi.get('');  // Empty string instead of '/'
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get menu by ID
  getMenuById: async (menuId) => {
    try {
      const response = await menuApi.get(`/${menuId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get menu categories
  getMenuCategories: async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/menu-categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken()
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new menu
  createMenu: async (menuData) => {
    try {
      const response = await menuApi.post('', menuData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update menu
  updateMenu: async (menuId, menuData) => {
    try {
      const response = await menuApi.patch(`/${menuId}`, menuData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete menu
  deleteMenu: async (menuId) => {
    try {
      const response = await menuApi.delete(`/${menuId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default menuService; 