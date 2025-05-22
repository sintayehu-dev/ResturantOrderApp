import React, { createContext, useContext, useState, useCallback } from 'react';
import invoiceService from '../services/invoiceService';

// Create context
const InvoiceContext = createContext();

// Provider
export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, []);

  // Get invoice by ID
  const getInvoiceById = useCallback(async (invoiceId) => {
    setLoading(true);
    setError(null);
    try {
      return await invoiceService.getInvoiceById(invoiceId);
    } catch (err) {
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new invoice
  const createInvoice = useCallback(async (invoiceData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.createInvoice(invoiceData);
      setInvoices(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update invoice
  const updateInvoice = useCallback(async (invoiceId, invoiceData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.updateInvoice(invoiceId, invoiceData);
      setInvoices(prev => prev.map(inv => inv.invoice_id === invoiceId ? data : inv));
      return data;
    } catch (err) {
      setError(err.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete invoice
  const deleteInvoice = useCallback(async (invoiceId) => {
    setLoading(true);
    setError(null);
    try {
      await invoiceService.deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(inv => inv.invoice_id !== invoiceId));
      return true;
    } catch (err) {
      setError(err.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = {
    invoices,
    loading,
    error,
    fetchInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};

// Custom hook
export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};

export default InvoiceContext; 