import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Row, Col, Modal, Form, Badge } from 'react-bootstrap';
import { useOrder } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import './OrderList.css';
import ConfirmDialog from '../../components/common/ConfirmDialog';

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

  // Always use an array for order items
  const orderItems = order.order_items || [];

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
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
          <h1 className="h3 mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            Order {order.order_id}
            <Badge className={`status-badge status-${order.order_status.toLowerCase()} ms-2`}>
              {order.order_status}
            </Badge>
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

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Order Information</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-card-list text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{order.order_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-grid-3x3 text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Table</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{order.table_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-calendar-event text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order Date</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{formatDate(order.order_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
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

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-clock-history text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Created At</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-clock text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Last Updated</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                        {formatDate(order.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-3" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Quick Actions</h5>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/order-items')}
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '78.75%' }}
                >
                  <span>View Order Items</span>
                  <i className="bi bi-list-ul"></i>
                </Button>
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '78.75%' }}
                >
                  <span>Print Order</span>
                  <i className="bi bi-printer"></i>
                </Button>
              </div>
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
              <Alert variant="danger" className="mb-3" style={{ fontSize: '78.75%' }}>
                {formError}
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
              style={{ fontSize: '78.75%' }}
            >
              <i className="bi bi-x-circle"></i>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              className="d-flex align-items-center gap-2"
              style={{ fontSize: '78.75%' }}
            >
              <i className="bi bi-check2-circle"></i>
              Update Status
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order ${order.order_id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Container>
  );
};

export default OrderDetail; 