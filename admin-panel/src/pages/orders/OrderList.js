import React, { useEffect, useState, useCallback } from 'react';
import { Container, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useOrder } from '../../contexts/OrderContext';
import { useTable } from '../../contexts/TableContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderList.css';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const OrderList = () => {
  const { orders, loading, error, fetchOrders, createOrder, deleteOrder, getNextOrderId } = useOrder();
  const { tables, fetchTables } = useTable();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    table_id: '',
    order_status: 'pending',
    order_total: 0,
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const handleShowModal = useCallback(async (order = null) => {
    if (order) {
      setFormData({
        order_id: order.order_id,
        table_id: order.table_id,
        order_status: order.order_status,
        order_total: order.order_total,
      });
    } else {
      const nextOrderId = await getNextOrderId();
      setFormData({
        order_id: nextOrderId,
        table_id: '',
        order_status: 'pending',
        order_total: 0,
      });
    }
    setFormError('');
    setShowModal(true);
  }, [getNextOrderId, setFormData, setFormError, setShowModal]);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    
    // Check if we should open create modal (coming from dashboard)
    if (location.state?.openCreateModal) {
      handleShowModal();
      // Clear the state to prevent modal from opening on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [fetchOrders, fetchTables, location.state, handleShowModal]);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      order_id: '',
      table_id: '',
      order_status: 'pending',
      order_total: 0,
    });
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormError('');
      
      // Validate form data
      if (!formData.table_id) {
        setFormError('Table selection is required');
        return;
      }
      
      const payload = {
        order_id: formData.order_id,
        table_id: formData.table_id,
        order_status: formData.order_status,
        order_total: parseFloat(formData.order_total) || 0,
      };
      
      await createOrder(payload);
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save order');
    }
  };

  const handleDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete);
      } catch (err) {
        console.error('Error deleting order:', err);
      }
    }
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'warning', text: 'Pending' },
      'preparing': { variant: 'info', text: 'Preparing' },
      'ready': { variant: 'primary', text: 'Ready' },
      'completed': { variant: 'success', text: 'Completed' },
      'cancelled': { variant: 'danger', text: 'Cancelled' }
    };
    return statusConfig[status.toLowerCase()] || { variant: 'secondary', text: status };
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.order_status === 'pending').length;
    const completedOrders = orders.filter(order => order.order_status === 'completed').length;
    const totalRevenue = orders.reduce((total, order) => total + (parseFloat(order.order_total) || 0), 0);
    
    return { totalOrders, pendingOrders, completedOrders, totalRevenue };
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <Alert variant="danger" className="error-alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <i className="bi bi-cart me-3 text-primary"></i>
              Order Management
            </h1>
            <p className="page-subtitle">
              Track and manage all restaurant orders, statuses, and customer requests
            </p>
          </div>
          <div className="header-actions">
            <Button 
              variant="primary" 
              onClick={() => handleShowModal()} 
              className="primary-action-btn"
              size="lg"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Create New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary mb-4">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon stat-icon-primary">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalOrders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-warning">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingOrders}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-success">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.completedOrders}</div>
              <div className="stat-label">Completed Orders</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-info">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{formatPrice(stats.totalRevenue)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="content-card">
        <Card.Header className="content-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-content">
              <h5 className="card-title mb-1">
                <i className="bi bi-list-ul me-2 text-primary"></i>
                Orders List
              </h5>
              <p className="text-muted mb-0">All restaurant orders with their current status</p>
            </div>
            <div className="header-actions">
              <Button variant="outline-primary" size="sm" className="export-btn">
                <i className="bi bi-download me-2"></i>
                Export
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="modern-table">
              <thead className="table-header">
                <tr>
                  <th>Order ID</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="empty-state">
                        <i className="bi bi-cart text-muted fs-1"></i>
                        <p className="mt-3 text-muted">No orders found</p>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowModal()}
                        >
                          Create First Order
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const table = tables.find(t => t.table_id === order.table_id);
                    const status = getStatusBadge(order.order_status);
                    
                    return (
                      <tr key={order.order_id} className="data-row">
                        <td>
                          <Button
                            variant="link"
                            className="p-0 text-decoration-none item-link"
                            onClick={() => navigate(`/orders/${order.order_id}`)}
                          >
                            <span className="item-id">#{order.order_id}</span>
                          </Button>
                        </td>
                        <td>
                          <div className="table-info">
                            <i className="bi bi-grid-3x3 me-2 text-muted"></i>
                            {table ? `Table ${table.table_number}` : `Table ${order.table_id}`}
                          </div>
                        </td>
                        <td>
                          <Badge className={`status-badge bg-${status.variant}`}>
                            {status.text}
                          </Badge>
                        </td>
                        <td>
                          <div className="order-amount">
                            <span className="amount-text">{formatPrice(order.order_total)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="order-date">
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(order)}
                              className="action-btn edit-btn"
                              title="Edit Order"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(order.order_id)}
                              className="action-btn delete-btn"
                              title="Delete Order"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Order Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className={`bi ${formData.order_id && formData.order_id !== '' ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
            {formData.order_id && formData.order_id !== '' ? 'Edit Order' : 'Create New Order'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="modal-body">
            {formError && (
              <Alert variant="danger" className="form-error-alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {formError}
              </Alert>
            )}

            <Form.Group className="form-group">
              <Form.Label className="form-label">Order ID</Form.Label>
              <Form.Control
                type="text"
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                required
                placeholder="Enter order ID"
                className="form-control-modern"
                disabled={!!formData.order_id}
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Table</Form.Label>
              <Form.Select
                name="table_id"
                value={formData.table_id}
                onChange={handleInputChange}
                required
                className="form-select-modern"
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table.table_id} value={table.table_id}>
                    Table {table.table_number} - {table.capacity} seats
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Order Status</Form.Label>
              <Form.Select
                name="order_status"
                value={formData.order_status}
                onChange={handleInputChange}
                required
                className="form-select-modern"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Order Total</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="order_total"
                value={formData.order_total}
                onChange={handleInputChange}
                required
                placeholder="0.00"
                className="form-control-modern"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button 
              variant="outline-secondary" 
              onClick={handleCloseModal} 
              className="cancel-btn"
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              className="submit-btn"
            >
              <i className={`bi ${formData.order_id && formData.order_id !== '' ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
              {formData.order_id && formData.order_id !== '' ? 'Update Order' : 'Create Order'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default OrderList; 