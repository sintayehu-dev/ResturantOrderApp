// src/utils/handleApiError.js
export default function handleApiError(error) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message && error.message === 'Network Error') {
    return 'Network error: Unable to reach the server. Please check your connection.';
  }
  return 'An unexpected error occurred. Please try again.';
} 