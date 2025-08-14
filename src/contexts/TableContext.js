import React, { createContext, useContext, useState, useCallback } from 'react';
import tableService from '../services/tableService';
import { useAuth } from './AuthContext';

// Create context
const TableContext = createContext();

// Create provider
export const TableProvider = ({ children }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all tables
  const fetchTables = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tableService.getAllTables();
      setTables(data);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get table by ID
  const getTableById = useCallback(async (tableId) => {
    if (!isAuthenticated() || !tableId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tableService.getTableById(tableId);
      return data;
    } catch (err) {
      console.error(`Error fetching table ${tableId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new table
  const createTable = useCallback(async (tableData) => {
    if (!isAuthenticated()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tableService.createTable(tableData);
      setTables(prevTables => [...prevTables, data]);
      await fetchTables();
      return data;
    } catch (err) {
      console.error('Error creating table:', err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchTables]);

  // Update table
  const updateTable = useCallback(async (tableId, tableData) => {
    if (!isAuthenticated() || !tableId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tableService.updateTable(tableId, tableData);
      setTables(prevTables => 
        prevTables.map(table => table.table_id === tableId ? data : table)
      );
      return data;
    } catch (err) {
      console.error(`Error updating table ${tableId}:`, err);
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Delete table
  const deleteTable = useCallback(async (tableId) => {
    if (!isAuthenticated() || !tableId) {
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await tableService.deleteTable(tableId);
      setTables(prevTables => prevTables.filter(table => table.table_id !== tableId));
      return true;
    } catch (err) {
      console.error(`Error deleting table ${tableId}:`, err);
      setError(err.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get next table ID
  const getNextTableId = useCallback(async () => {
    try {
      return await tableService.getNextTableId();
    } catch (err) {
      console.error('Error getting next table ID:', err);
      return 'table-001'; // Default fallback
    }
  }, []);

  // Create context value
  const contextValue = {
    tables,
    loading,
    error,
    fetchTables,
    getTableById,
    createTable,
    updateTable,
    deleteTable,
    getNextTableId,
  };

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
};

// Create custom hook
export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};

export default TableContext; 