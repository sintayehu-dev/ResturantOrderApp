import axios from 'axios';
import { API_BASE_URL } from '../config';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const ORDER_ITEM_API_URL = `${cleanBaseUrl}/orderItems`;

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
const orderItemApi = axios.create({
  baseURL: ORDER_ITEM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
orderItemApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
orderItemApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the backend server is running and CORS is enabled.');
    }
    return Promise.reject(error);
  }
);

const orderItemService = {
  // Get all order items
  getAllOrderItems: async () => {
    try {
      const response = await orderItemApi.get('');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order item by ID
  getOrderItemById: async (orderItemId) => {
    try {
      const response = await orderItemApi.get(`/${orderItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order items by order ID
  getOrderItemsByOrderId: async (orderId) => {
    try {
      const response = await orderItemApi.get(`/orders/${orderId}/items`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new order item
  createOrderItem: async (orderItemData) => {
    try {
      const response = await orderItemApi.post('', orderItemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update order item
  updateOrderItem: async (orderItemId, orderItemData) => {
    try {
      const response = await orderItemApi.patch(`/${orderItemId}`, orderItemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete order item
  deleteOrderItem: async (orderItemId) => {
    try {
      const response = await orderItemApi.delete(`/${orderItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get next order item ID
  getNextOrderItemId: async () => {
    try {
      const items = await orderItemService.getAllOrderItems();
      if (!items || items.length === 0) return 'item-001';
      const numbers = items
        .map(item => {
          const match = item.order_item_id && item.order_item_id.match(/^item-(\d+)$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(num => num !== null);
      const max = numbers.length ? Math.max(...numbers) : 0;
      const next = (max + 1).toString().padStart(3, '0');
      return `item-${next}`;
    } catch (error) {
      console.error('Error getting next order item ID:', error);
      return 'item-001';
    }
  }
};

export default orderItemService; 