import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
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

// Create axios instance with default config for CRUD operations
const tableApi = axios.create({
  baseURL: `${cleanBaseUrl}/tables`,  // Use tables endpoint for CRUD operations
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add request interceptor to include auth token
tableApi.interceptors.request.use(
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
tableApi.interceptors.response.use(
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

// Get all tables (for admin management and ID generation)
const getAllTables = async () => {
  try {
    const response = await axios.get(`${cleanBaseUrl}/tables`, {
      headers: {
        'Authorization': getAuthToken(),
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get available tables (for assigning to new orders)
const getAvailableTables = async () => {
  try {
    const response = await axios.get(`${cleanBaseUrl}/available-tables`, {
      headers: {
        'Authorization': getAuthToken(),
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

const tableService = {
  getAllTables,
  getAvailableTables,
  // Get table by ID (uses the /tables/:table_id endpoint)
  getTableById: async (tableId) => {
    try {
      const response = await tableApi.get(`/${tableId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new table (uses the /tables endpoint)
  createTable: async (tableData) => {
    try {
      const response = await tableApi.post('', tableData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update table (uses the /tables/:table_id endpoint)
  updateTable: async (tableId, tableData) => {
    try {
      const response = await tableApi.patch(`/${tableId}`, tableData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete table (uses the /tables/:table_id endpoint)
  deleteTable: async (tableId) => {
    try {
      const response = await tableApi.delete(`/${tableId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get next table ID (uses all tables, not just available)
  getNextTableId: async () => {
    try {
      const tables = await getAllTables();
      if (!tables || tables.length === 0) return 'table-001';
      const numbers = tables
        .map(table => {
          const match = table.table_id && table.table_id.match(/^table-(\d+)$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(num => num !== null);
      const max = numbers.length ? Math.max(...numbers) : 0;
      const next = (max + 1).toString().padStart(3, '0');
      return `table-${next}`;
    } catch (error) {
      console.error('Error getting next table ID:', error);
      return 'table-001';
    }
  }
};

export default tableService; 