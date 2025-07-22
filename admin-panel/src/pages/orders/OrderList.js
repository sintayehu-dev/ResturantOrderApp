import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchOrders();
    fetchTables();
    
    // Check if we should open create modal (coming from dashboard)
    if (location.state?.openCreateModal) {
      handleShowModal();
      // Clear the state to prevent modal from opening on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [fetchOrders, fetchTables, location.state]);

  const handleShowModal = async (order = null) => {
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
  };

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

  const getStatusBadge = (status) => {
    let badgeClass = '';
    
    switch(status.toLowerCase()) {
      case 'pending':
        badgeClass = 'status-pending';
        break;
      case 'preparing':
        badgeClass = 'status-preparing';
        break;
      case 'ready':
        badgeClass = 'status-ready';
        break;
      case 'completed':
        badgeClass = 'status-completed';
        break;
      case 'cancelled':
        badgeClass = 'status-cancelled';
        break;
      default:
        badgeClass = 'bg-secondary';
    }
    
    return (
      <Badge className={`status-badge ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 p-md-4 order-list-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 page-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Order Management</h1>
        <Button 
          variant="primary" 
          onClick={() => handleShowModal()} 
          className="d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i>
          <span style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Create New Order</span>
        </Button>
      </div>

      <Card className="order-card shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <div className="table-responsive">
            <Table hover className="align-middle order-table">
              <thead>
                <tr>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Order ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Date</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Table</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Status</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Total</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none order-link"
                        onClick={() => navigate(`/orders/${order.order_id}`)}
                        style={{ fontSize: '78.75%', fontWeight: 'normal' }}
                      >
                        {order.order_id}
                      </Button>
                    </td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatDate(order.order_date)}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{order.table_id}</td>
                    <td>{getStatusBadge(order.order_status)}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatPrice(order.order_total)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.order_id}`)}
                          className="action-icon-btn edit-btn"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(order.order_id)}
                          className="action-icon-btn delete-btn"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Create Order Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="order-modal">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            Create New Order
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3">
                <p className="mb-0" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formError}</p>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Order ID</Form.Label>
              <Form.Control
                type="text"
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                required
                placeholder="Enter order ID"
                disabled={true}
                className="form-input"
                style={{ fontSize: '78.75%' }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '75%' }}>
                Order ID is automatically generated
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Table</Form.Label>
              <Form.Select
                name="table_id"
                value={formData.table_id}
                onChange={handleInputChange}
                required
                className="form-select"
                style={{ fontSize: '78.75%' }}
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table.table_id} value={table.table_id}>
                    {table.table_name} ({table.table_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Status</Form.Label>
              <Form.Select
                name="order_status"
                value={formData.order_status}
                onChange={handleInputChange}
                required
                className="form-select"
                style={{ fontSize: '78.75%' }}
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="outline-secondary" 
              onClick={handleCloseModal} 
              className="d-flex align-items-center gap-2"
              style={{ fontSize: '78.75%', fontWeight: 'bold' }}
            >
              <i className="bi bi-x-circle"></i>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              className="d-flex align-items-center gap-2"
              style={{ fontSize: '78.75%', fontWeight: 'bold' }}
            >
              <i className="bi bi-plus-circle"></i>
              Create Order
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
        message="Are you sure you want to delete this order?"
        confirmText="Yes"
        cancelText="No"
      />
    </Container>
  );
};

export default OrderList; 