import axios from 'axios';
import { API_BASE_URL } from '../config';
import handleApiError from '../utils/handleApiError';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

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

// Create axios instance with default config for orders
const orderApi = axios.create({
  baseURL: `${cleanBaseUrl}/orders`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add request interceptor to include auth token
orderApi.interceptors.request.use(
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
orderApi.interceptors.response.use(
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

const orderService = {
  // Get all orders - Admin only
  getAllOrders: async () => {
    try {
      const response = await orderApi.get('');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get order by ID - Mixed access
  getOrderById: async (orderId) => {
    try {
      const response = await orderApi.get(`/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new order - Mixed access
  createOrder: async (orderData) => {
    try {
      const response = await orderApi.post('', orderData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update order - Admin only
  updateOrder: async (orderId, orderData) => {
    try {
      const response = await orderApi.patch(`/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete order - Admin only
  deleteOrder: async (orderId) => {
    try {
      const response = await orderApi.delete(`/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get next order ID - Helper function (not an API endpoint)
  getNextOrderId: async () => {
    try {
      const orders = await orderService.getAllOrders();
      if (!orders || orders.length === 0) return 'order-001';
      
      // Extract numbers from order_id like "order-004"
      const numbers = orders
        .map(order => {
          const match = order.order_id && order.order_id.match(/^order-(\d+)$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(num => num !== null);
      
      const max = numbers.length ? Math.max(...numbers) : 0;
      const next = (max + 1).toString().padStart(3, '0');
      return `order-${next}`;
    } catch (error) {
      console.error('Error getting next order ID:', error);
      return 'order-001'; // Default fallback
    }
  }
};

export default orderService; 