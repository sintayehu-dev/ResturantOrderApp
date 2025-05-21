import React, { createContext, useContext, useState, useCallback } from 'react';
import menuService from '../services/menuService';
import { useAuth } from './AuthContext';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all menus
  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getAllMenus();
      setMenus(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch menus');
      console.error('Error in fetchMenus:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch menu categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getMenuCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error in fetchCategories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get menu by ID
  const getMenuById = useCallback(async (menuId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getMenuById(menuId);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch menu');
      console.error('Error in getMenuById:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new menu
  const createMenu = useCallback(async (menuData) => {
    try {
      setLoading(true);
      setError(null);
      const newMenu = await menuService.createMenu(menuData);
      setMenus(prev => [...prev, newMenu]);
      return newMenu;
    } catch (err) {
      setError(err.message || 'Failed to create menu');
      console.error('Error in createMenu:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update menu
  const updateMenu = useCallback(async (menuId, menuData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMenu = await menuService.updateMenu(menuId, menuData);
      setMenus(prev => prev.map(menu => 
        menu.menu_id === menuId ? updatedMenu : menu
      ));
      return updatedMenu;
    } catch (err) {
      setError(err.message || 'Failed to update menu');
      console.error('Error in updateMenu:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete menu
  const deleteMenu = useCallback(async (menuId) => {
    try {
      setLoading(true);
      setError(null);
      await menuService.deleteMenu(menuId);
      setMenus(prev => prev.filter(menu => menu.menu_id !== menuId));
    } catch (err) {
      setError(err.message || 'Failed to delete menu');
      console.error('Error in deleteMenu:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    menus,
    categories,
    loading,
    error,
    fetchMenus,
    fetchCategories,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuContext; 