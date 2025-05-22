import React, { createContext, useContext, useState, useCallback } from 'react';
import orderItemService from '../services/orderItemService';
import { useAuth } from './AuthContext';

// Create context
const OrderItemContext = createContext();

// Create provider
export const OrderItemProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all order items
  const fetchOrderItems = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderItemService.getAllOrderItems();
      setOrderItems(data);
    } catch (err) {
      console.error('Error fetching order items:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch order items by order ID
  const fetchOrderItemsByOrderId = useCallback(async (orderId) => {
    if (!isAuthenticated() || !orderId) {
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderItemService.getOrderItemsByOrderId(orderId);
      return data;
    } catch (err) {
      console.error(`Error fetching order items for order ${orderId}:`, err);
      setError(err.toString());
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get order item by ID
  const getOrderItemById = useCallback(async (orderItemId) => {
    if (!isAuthenticated() || !orderItemId) {
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderItemService.getOrderItemById(orderItemId);
      return data;
    } catch (err) {
      console.error(`Error fetching order item ${orderItemId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new order item
  const createOrderItem = useCallback(async (orderItemData) => {
    if (!isAuthenticated()) {
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderItemService.createOrderItem(orderItemData);
      setOrderItems(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating order item:', err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Update order item
  const updateOrderItem = useCallback(async (orderItemId, orderItemData) => {
    if (!isAuthenticated() || !orderItemId) {
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderItemService.updateOrderItem(orderItemId, orderItemData);
      setOrderItems(prev => prev.map(item => item.order_item_id === orderItemId ? data : item));
      return data;
    } catch (err) {
      console.error(`Error updating order item ${orderItemId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Delete order item
  const deleteOrderItem = useCallback(async (orderItemId) => {
    if (!isAuthenticated() || !orderItemId) {
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      await orderItemService.deleteOrderItem(orderItemId);
      setOrderItems(prev => prev.filter(item => item.order_item_id !== orderItemId));
      return true;
    } catch (err) {
      console.error(`Error deleting order item ${orderItemId}:`, err);
      setError(err.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get next order item ID
  const getNextOrderItemId = useCallback(async () => {
    try {
      return await orderItemService.getNextOrderItemId();
    } catch (err) {
      console.error('Error getting next order item ID:', err);
      return 'item-001';
    }
  }, []);

  // Create context value
  const contextValue = {
    orderItems,
    loading,
    error,
    fetchOrderItems,
    fetchOrderItemsByOrderId,
    getOrderItemById,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
    getNextOrderItemId,
  };

  return (
    <OrderItemContext.Provider value={contextValue}>
      {children}
    </OrderItemContext.Provider>
  );
};

// Custom hook
export const useOrderItem = () => {
  const context = useContext(OrderItemContext);
  if (!context) {
    throw new Error('useOrderItem must be used within an OrderItemProvider');
  }
  return context;
};

export default OrderItemContext; 