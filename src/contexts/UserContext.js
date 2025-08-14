import React, { createContext, useContext, useState, useCallback } from 'react';
import userService from '../services/userService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user profile
  const getUserProfile = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const profile = await userService.getUserProfile(userId);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setError(err.message || 'Failed to fetch user profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await userService.updateUserProfile(userId, userData);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message || 'Failed to update user profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (userId, passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.changePassword(userId, passwordData);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear user profile
  const clearUserProfile = useCallback(() => {
    setUserProfile(null);
    setError(null);
  }, []);

  const value = {
    userProfile,
    loading,
    error,
    getUserProfile,
    updateUserProfile,
    changePassword,
    clearUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 