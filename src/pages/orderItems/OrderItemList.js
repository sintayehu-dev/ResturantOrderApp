import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Modal, Form, Alert, InputGroup } from 'react-bootstrap';
import { useOrderItem } from '../../contexts/OrderItemContext';
import { useOrder } from '../../contexts/OrderContext';
import { useFood } from '../../contexts/FoodContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const OrderItemList = () => {
  const { orderItems, loading, error, fetchOrderItems, createOrderItem, updateOrderItem, deleteOrderItem, getNextOrderItemId } = useOrderItem();
  const { orders, fetchOrders } = useOrder();
  const { foods, fetchFoods } = useFood();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [formData, setFormData] = useState({
    order_item_id: '',
    order_id: '',
    food_id: '',
    quantity: '',
  });
  const [formError, setFormError] = useState('');
  const [foodPrice, setFoodPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderItemToDelete, setOrderItemToDelete] = useState(null);

  useEffect(() => {
    fetchOrderItems();
    fetchOrders();
    fetchFoods();
  }, [fetchOrderItems, fetchOrders, fetchFoods]);

  useEffect(() => {
    const food = foods.find(f => f.food_id === formData.food_id);
    const price = food ? Number(food.price) : 0;
    setFoodPrice(price);
    const qty = Number(formData.quantity) || 0;
    setTotalPrice(price * qty);
  }, [formData.food_id, formData.quantity, foods]);

  const handleShowModal = async (orderItem = null) => {
    if (orderItem) {
      setSelectedOrderItem(orderItem);
      setFormData({
        order_item_id: orderItem.order_item_id,
        order_id: orderItem.order_id,
        food_id: orderItem.food_id,
        quantity: orderItem.quantity,
      });
    } else {
      setSelectedOrderItem(null);
      const nextOrderItemId = await getNextOrderItemId();
      setFormData({
        order_item_id: nextOrderItemId,
        order_id: '',
        food_id: '',
        quantity: '',
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrderItem(null);
    setFormData({
      order_item_id: '',
      order_id: '',
      food_id: '',
      quantity: '',
    });
    setFormError('');
    setFoodPrice(0);
    setTotalPrice(0);
  };

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
    if (!formData.order_id) {
      setFormError('Order selection is required');
      return;
    }
    if (!formData.food_id) {
      setFormError('Food selection is required');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setFormError('Quantity must be greater than zero');
      return;
    }
    const payload = {
      order_item_id: formData.order_item_id,
      order_id: formData.order_id,
      food_id: formData.food_id,
      quantity: parseInt(formData.quantity, 10),
    };
    try {
      if (selectedOrderItem) {
        await updateOrderItem(selectedOrderItem.order_item_id, payload);
      } else {
        const existingItem = orderItems.find(item => 
          item.order_id === formData.order_id && item.food_id === formData.food_id
        );
        if (existingItem) {
          const updatedPayload = {
            ...payload,
            order_item_id: existingItem.order_item_id,
            quantity: existingItem.quantity + parseInt(formData.quantity, 10)
          };
          await updateOrderItem(existingItem.order_item_id, updatedPayload);
        } else {
          await createOrderItem(payload);
        }
      }
      handleCloseModal();
      fetchOrderItems();
    } catch (err) {
      setFormError(err.message || 'Failed to save order item');
    }
  };

  const handleDelete = (orderItemId) => {
    setOrderItemToDelete(orderItemId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (orderItemToDelete) {
      try {
        await deleteOrderItem(orderItemToDelete);
      } catch (err) {
        console.error('Error deleting order item:', err);
      }
    }
    setShowDeleteModal(false);
    setOrderItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading order items...</p>
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <i className="bi bi-box-seam me-3 text-primary"></i>
              Order Item Management
            </h1>
            <p className="page-subtitle">Create and manage items within orders</p>
          </div>
          <div className="header-actions">
            <Button 
              variant="primary" 
              onClick={() => handleShowModal()} 
              className="primary-action-btn"
              size="lg"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add New Order Item
            </Button>
          </div>
        </div>
      </div>

      <Card className="content-card">
        <Card.Header className="content-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-content">
              <h5 className="card-title mb-1">
                <i className="bi bi-list-ul me-2 text-primary"></i>
                Order Items List
              </h5>
              <p className="text-muted mb-0">All items associated with orders</p>
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
                  <th>Order Item ID</th>
                  <th>Order ID</th>
                  <th>Food ID</th>
                  <th>Quantity</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="empty-state">
                        <i className="bi bi-box-seam text-muted fs-1"></i>
                        <p className="mt-3 text-muted">No order items found</p>
                        <Button variant="outline-primary" size="sm" onClick={() => handleShowModal()}>
                          Create First Order Item
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item) => (
                    <tr key={item.order_item_id} className="data-row">
                      <td>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none item-link"
                          onClick={() => navigate(`/order-items/${item.order_item_id}`)}
                        >
                          <span className="item-id">{item.order_item_id}</span>
                        </Button>
                      </td>
                      <td>{item.order_id}</td>
                      <td>{item.food_id}</td>
                      <td>{item.quantity}</td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</td>
                      <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : ''}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(item)}
                            className="action-btn edit-btn"
                            title="Edit Order Item"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item.order_item_id)}
                            className="action-btn delete-btn"
                            title="Delete Order Item"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className={`bi ${selectedOrderItem ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
            {selectedOrderItem ? 'Edit Order Item' : 'Add New Order Item'}
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
              <Form.Label className="form-label">Order Item ID</Form.Label>
              <Form.Control
                type="text"
                name="order_item_id"
                value={formData.order_item_id}
                disabled
                className="form-control-modern"
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Order</Form.Label>
              <Form.Select
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                required
                className="form-select-modern"
              >
                <option value="">Select an order</option>
                {orders.map(order => (
                  <option key={order.order_id} value={order.order_id}>
                    {order.order_id} (Table: {order.table_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Food</Form.Label>
              <Form.Select
                name="food_id"
                value={formData.food_id}
                onChange={handleInputChange}
                required
                className="form-select-modern"
              >
                <option value="">Select a food</option>
                {foods.map(food => (
                  <option key={food.food_id} value={food.food_id}>
                    {food.name} ({food.food_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Price</Form.Label>
              <Form.Control
                type="text"
                value={foodPrice ? `$${foodPrice.toFixed(2)}` : ''}
                readOnly
                plaintext
                className="form-control-modern"
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Quantity</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  className="form-control-modern"
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Total</Form.Label>
              <Form.Control
                type="text"
                value={foodPrice && formData.quantity ? `$${totalPrice.toFixed(2)}` : ''}
                readOnly
                plaintext
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
              <i className={`bi ${selectedOrderItem ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
              {selectedOrderItem ? 'Update Order Item' : 'Create Order Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      <ConfirmDialog
        show={showDeleteModal}
        onHide={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Order Item"
        message="Are you sure you want to delete this order item? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default OrderItemList; 