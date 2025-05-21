import React, { createContext, useContext, useState, useCallback } from 'react';
import foodService from '../services/foodService';
import { useAuth } from './AuthContext';

// Create context
const FoodContext = createContext();

// Create provider
export const FoodProvider = ({ children }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all foods
  const fetchFoods = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await foodService.getAllFoods();
      setFoods(data);
    } catch (err) {
      console.error('Error fetching foods:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch foods by menu ID
  const fetchFoodsByMenuId = useCallback(async (menuId) => {
    if (!isAuthenticated() || !menuId) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await foodService.getFoodsByMenuId(menuId);
      return data;
    } catch (err) {
      console.error(`Error fetching foods for menu ${menuId}:`, err);
      setError(err.toString());
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get food by ID
  const getFoodById = useCallback(async (foodId) => {
    if (!isAuthenticated() || !foodId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await foodService.getFoodById(foodId);
      return data;
    } catch (err) {
      console.error(`Error fetching food ${foodId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new food
  const createFood = useCallback(async (foodData) => {
    if (!isAuthenticated()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await foodService.createFood(foodData);
      setFoods(prevFoods => [...prevFoods, data]);
      return data;
    } catch (err) {
      console.error('Error creating food:', err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Update food
  const updateFood = useCallback(async (foodId, foodData) => {
    if (!isAuthenticated() || !foodId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await foodService.updateFood(foodId, foodData);
      setFoods(prevFoods => 
        prevFoods.map(food => food.food_id === foodId ? data : food)
      );
      return data;
    } catch (err) {
      console.error(`Error updating food ${foodId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Delete food
  const deleteFood = useCallback(async (foodId) => {
    if (!isAuthenticated() || !foodId) {
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await foodService.deleteFood(foodId);
      setFoods(prevFoods => prevFoods.filter(food => food.food_id !== foodId));
      return true;
    } catch (err) {
      console.error(`Error deleting food ${foodId}:`, err);
      setError(err.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get next food ID
  const getNextFoodId = useCallback(async () => {
    try {
      return await foodService.getNextFoodId();
    } catch (err) {
      console.error('Error getting next food ID:', err);
      return 'food-001'; // Default fallback
    }
  }, []);

  // Create context value
  const contextValue = {
    foods,
    loading,
    error,
    fetchFoods,
    fetchFoodsByMenuId,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
    getNextFoodId,
  };

  return (
    <FoodContext.Provider value={contextValue}>
      {children}
    </FoodContext.Provider>
  );
};

// Create custom hook
export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};

export default FoodContext; 