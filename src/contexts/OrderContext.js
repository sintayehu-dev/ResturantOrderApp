import React, { createContext, useContext, useState, useCallback } from 'react';
import orderService from '../services/orderService';
import { useAuth } from './AuthContext';

// Create context
const OrderContext = createContext();

// Create provider
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch all orders (admin only)
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get order by ID
  const getOrderById = useCallback(async (orderId) => {
    if (!isAuthenticated() || !orderId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.getOrderById(orderId);
      return data;
    } catch (err) {
      console.error(`Error fetching order ${orderId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    if (!isAuthenticated()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.createOrder(orderData);
      setOrders(prevOrders => [...prevOrders, data]);
      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Update order
  const updateOrder = useCallback(async (orderId, orderData) => {
    if (!isAuthenticated() || !orderId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.updateOrder(orderId, orderData);
      setOrders(prevOrders => 
        prevOrders.map(order => order.order_id === orderId ? data : order)
      );
      return data;
    } catch (err) {
      console.error(`Error updating order ${orderId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Delete order
  const deleteOrder = useCallback(async (orderId) => {
    if (!isAuthenticated() || !orderId) {
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await orderService.deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
      return true;
    } catch (err) {
      console.error(`Error deleting order ${orderId}:`, err);
      setError(err.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get next order ID
  const getNextOrderId = useCallback(async () => {
    try {
      return await orderService.getNextOrderId();
    } catch (err) {
      console.error('Error getting next order ID:', err);
      return 'order-001'; // Default fallback
    }
  }, []);

  // Create context value
  const contextValue = {
    orders,
    loading,
    error,
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getNextOrderId,
    isAdmin: user?.User_type === 'ADMIN'
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

// Create custom hook
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext; 