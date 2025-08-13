import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Row, Col, Modal, Form, InputGroup } from 'react-bootstrap';
import { useOrderItem } from '../../contexts/OrderItemContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const OrderItemDetail = () => {
  const { orderItemId } = useParams();
  const navigate = useNavigate();
  const { getOrderItemById, updateOrderItem, deleteOrderItem, loading, error } = useOrderItem();
  const [orderItem, setOrderItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    food_id: '',
    quantity: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchOrderItemDetails = async () => {
      try {
        const data = await getOrderItemById(orderItemId);
        setOrderItem(data);
        setFormData({
          order_id: data.order_id,
          food_id: data.food_id,
          quantity: data.quantity,
        });
      } catch (err) {
        console.error('Error fetching order item details:', err);
      }
    };
    fetchOrderItemDetails();
  }, [orderItemId, getOrderItemById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const quantityValue = parseInt(value, 10);
      if (value && !isNaN(quantityValue)) {
        setFormData(prev => ({ ...prev, [name]: quantityValue }));
      } else if (value === '') {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    // Validate form data
    if (!formData.order_id.trim()) {
      setFormError('Order ID is required');
      return;
    }
    if (!formData.food_id.trim()) {
      setFormError('Food ID is required');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setFormError('Quantity must be greater than zero');
      return;
    }
    const payload = {
      order_item_id: orderItem.order_item_id,
      order_id: formData.order_id,
      food_id: formData.food_id,
      quantity: parseInt(formData.quantity, 10),
    };
    try {
      const updated = await updateOrderItem(orderItemId, payload);
      setOrderItem(updated);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update order item');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrderItem(orderItemId);
      navigate('/order-items');
    } catch (err) {
      console.error('Error deleting order item:', err);
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

  if (!orderItem) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Order item not found</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate('/order-items')}
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Order Items
          </Button>
          <h1 className="h3 mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            Order Item Details
          </h1>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowEditModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-pencil"></i>
            Edit Order Item
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-trash"></i>
            Delete Order Item
          </Button>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Order Item Details</h5>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-tag text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order Item ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{orderItem.order_item_id}</span>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-bag text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{orderItem.order_id}</span>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-egg-fried text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Food ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{orderItem.food_id}</span>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-123 text-warning"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Quantity</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{orderItem.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-clock-history text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Created At</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                        {orderItem.created_at ? new Date(orderItem.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-clock text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Last Updated</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                        {orderItem.updated_at ? new Date(orderItem.updated_at).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Order Item Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Edit Order Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3" style={{ fontSize: '78.75%' }}>
                {formError}
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
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Food ID</Form.Label>
              <Form.Control
                type="text"
                name="food_id"
                value={formData.food_id}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Quantity</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  style={{ fontSize: '78.75%' }}
                />
              </InputGroup>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowEditModal(false)}
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
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Order Item"
        message={`Are you sure you want to delete order item ${orderItem.order_item_id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Container>
  );
};

export default OrderItemDetail; 