import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Row, Col, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useOrder } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import './OrderList.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder, deleteOrder, loading, error } = useOrder();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusData, setStatusData] = useState({ order_status: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        setStatusData({ order_status: data.order_status });
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    };

    fetchOrderDetails();
  }, [orderId, getOrderById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStatusData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setFormError('');
      
      const payload = {
        order_id: order.order_id,
        order_status: statusData.order_status,
      };

      const updatedOrder = await updateOrder(orderId, payload);
      setOrder(updatedOrder);
      setShowStatusModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update order status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(orderId);
      navigate('/orders');
    } catch (err) {
      console.error('Error deleting order:', err);
    }
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

  if (!order) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Order not found</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 p-md-4 order-list-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 detail-header">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate('/orders')}
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Orders
          </Button>
          <h1 className="h3 mb-0 detail-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            Order {order.order_id} 
            <span className="ms-3">{getStatusBadge(order.order_status)}</span>
          </h1>
          <div className="text-muted mt-2" style={{ fontSize: '78.75%' }}>
            Created on {formatDate(order.created_at)}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowStatusModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-pencil-square"></i>
            Update Status
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-trash"></i>
            Delete Order
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="detail-card shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Order Information</h5>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-card-list text-primary"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order ID</small>
                    <span className="fw-medium" style={{ fontSize: '78.75%' }}>{order.order_id}</span>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-grid-3x3 text-info"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '75%' }}>Table</small>
                    <span className="fw-medium" style={{ fontSize: '78.75%' }}>{order.table_id}</span>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-calendar-event text-success"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order Date</small>
                    <span className="fw-medium" style={{ fontSize: '78.75%' }}>{formatDate(order.order_date)}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-currency-dollar text-warning"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '75%' }}>Total Amount</small>
                    <span className="fw-bold order-total" style={{ fontSize: '78.75%' }}>{formatPrice(order.order_total)}</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="detail-card h-100 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Order Items</h5>
              </div>
              
              {order.order_items && order.order_items.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="order-items-table">
                    <thead>
                      <tr>
                        <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Item</th>
                        <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Unit Price</th>
                        <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Quantity</th>
                        <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.food_name || item.food_id}</td>
                          <td className="item-price" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatPrice(item.unit_price)}</td>
                          <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.quantity}</td>
                          <td className="item-price" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatPrice(item.unit_price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold" style={{ fontSize: '78.75%' }}>Total:</td>
                        <td className="fw-bold order-total" style={{ fontSize: '78.75%' }}>{formatPrice(order.order_total)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-cart fs-3 mb-3"></i>
                  <p style={{ fontSize: '78.75%' }}>No items in this order</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Update Order Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3">
                <p className="mb-0" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formError}</p>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Status</Form.Label>
              <Form.Select
                name="order_status"
                value={statusData.order_status}
                onChange={handleInputChange}
                required
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
              onClick={() => setShowStatusModal(false)}
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
              <i className="bi bi-check-circle"></i>
              Update Status
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Delete Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '78.75%', fontWeight: 'normal' }}>Are you sure you want to delete order <strong>{order.order_id}</strong>?</p>
          <p className="text-danger" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteModal(false)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-x-circle"></i>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-trash"></i>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderDetail; 