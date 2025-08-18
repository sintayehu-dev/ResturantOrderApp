import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import handleApiError from '../utils/handleApiError';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const FOOD_API_URL = `${cleanBaseUrl}/foods`;

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
const foodApi = axios.create({
  baseURL: FOOD_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add request interceptor to include auth token
foodApi.interceptors.request.use(
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
foodApi.interceptors.response.use(
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

const uploadFoodImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('food_image', file);
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'multipart/form-data'
    };
    if (token) {
      headers.Authorization = token;
    }
    const response = await axios.post(
      `${cleanBaseUrl}/foods/upload-image`,
      formData,
      { headers }
    );
    return response.data.image_url;
  } catch (error) {
    throw handleApiError(error);
  }
};

const extractItems = (payload) => {
  // Supports both old (array) and new (paginated object) API shapes
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

const foodService = {
  // Get all foods
  getAllFoods: async (params = {}) => {
    try {
      const response = await foodApi.get('', { params: { page: 1, limit: 1000, ...params } });
      return extractItems(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get food by ID
  getFoodById: async (foodId) => {
    try {
      const response = await foodApi.get(`/${foodId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get foods by menu ID
  getFoodsByMenuId: async (menuId, params = {}) => {
    try {
      const response = await foodApi.get('', { params: { menu_id: menuId, page: 1, limit: 1000, ...params } });
      return extractItems(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new food
  createFood: async (foodData) => {
    try {
      const response = await foodApi.post('', foodData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update food
  updateFood: async (foodId, foodData) => {
    try {
      const response = await foodApi.patch(`/${foodId}`, foodData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete food
  deleteFood: async (foodId) => {
    try {
      const response = await foodApi.delete(`/${foodId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get next food ID
  getNextFoodId: async () => {
    try {
      const foods = await foodService.getAllFoods({ page: 1, limit: 10000 });
      if (!foods || foods.length === 0) return 'food-001';
      
      // Extract numbers from food_id like "food-004"
      const numbers = foods
        .map(food => {
          const match = food.food_id && food.food_id.match(/^food-(\d+)$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(num => num !== null);
      
      const max = numbers.length ? Math.max(...numbers) : 0;
      const next = (max + 1).toString().padStart(3, '0');
      return `food-${next}`;
    } catch (error) {
      console.error('Error getting next food ID:', error);
      return 'food-001'; // Default fallback
    }
  },
  uploadFoodImage,
};

export default foodService; 