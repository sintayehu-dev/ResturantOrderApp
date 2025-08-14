import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import handleApiError from '../utils/handleApiError';

// Remove trailing slash from base URL if present
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const INVOICE_API_URL = `${cleanBaseUrl}/invoices`;

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
const invoiceApi = axios.create({
  baseURL: INVOICE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
invoiceApi.interceptors.request.use(
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
invoiceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the backend server is running and CORS is enabled.');
    }
    return Promise.reject(error);
  }
);

const invoiceService = {
  // Get all invoices
  getAllInvoices: async () => {
    try {
      const response = await invoiceApi.get('');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await invoiceApi.get(`/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const response = await invoiceApi.post('', invoiceData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      const response = await invoiceApi.patch(`/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const response = await invoiceApi.delete(`/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default invoiceService; 