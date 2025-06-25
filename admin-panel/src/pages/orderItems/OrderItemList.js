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
    // Update food price and total when food or quantity changes
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
    // Validate form data
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
        // Check if an order item with the same order_id and food_id exists
        const existingItem = orderItems.find(item => 
          item.order_id === formData.order_id && item.food_id === formData.food_id
        );
        
        if (existingItem) {
          // If exists, update with combined quantity
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
      fetchOrderItems(); // Refresh the list
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
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 page-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Order Item Management</h1>
        <Button 
          variant="primary" 
          onClick={() => handleShowModal()} 
          className="d-flex align-items-center gap-2"
          style={{ fontSize: '78.75%', fontWeight: 'bold' }}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Add New Order Item</span>
        </Button>
      </div>
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Order Item ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Order ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Food ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Quantity</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Created At</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Updated At</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.order_item_id}>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none order-link"
                        onClick={() => navigate(`/order-items/${item.order_item_id}`)}
                        style={{ fontSize: '78.75%', fontWeight: 'normal' }}
                      >
                        {item.order_item_id}
                      </Button>
                    </td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.order_id}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.food_id}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.quantity}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{item.updated_at ? new Date(item.updated_at).toLocaleString() : ''}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(item)}
                          className="action-icon-btn edit-btn"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item.order_item_id)}
                          className="action-icon-btn delete-btn"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orderItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>
                      No order items found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      {/* Add/Edit Order Item Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>{selectedOrderItem ? 'Edit Order Item' : 'Add New Order Item'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3">
                <p className="mb-0" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formError}</p>
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Order Item ID</Form.Label>
              <Form.Control
                type="text"
                name="order_item_id"
                value={formData.order_item_id}
                disabled
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Order</Form.Label>
              <Form.Select
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              >
                <option value="">Select an order</option>
                {orders.map(order => (
                  <option key={order.order_id} value={order.order_id}>
                    {order.order_id} (Table: {order.table_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Food</Form.Label>
              <Form.Select
                name="food_id"
                value={formData.food_id}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              >
                <option value="">Select a food</option>
                {foods.map(food => (
                  <option key={food.food_id} value={food.food_id}>
                    {food.name} ({food.food_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Price</Form.Label>
              <Form.Control
                type="text"
                value={foodPrice ? `$${foodPrice.toFixed(2)}` : ''}
                readOnly
                plaintext
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
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Total</Form.Label>
              <Form.Control
                type="text"
                value={foodPrice && formData.quantity ? `$${totalPrice.toFixed(2)}` : ''}
                readOnly
                plaintext
                style={{ fontSize: '78.75%' }}
              />
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
              <i className={`bi ${selectedOrderItem ? 'bi-check2-circle' : 'bi-plus-circle'}`}></i>
              {selectedOrderItem ? 'Update Order Item' : 'Create Order Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Order Item"
        message="Are you sure you want to delete this order item?"
        confirmText="Yes"
        cancelText="No"
      />
    </Container>
  );
};

export default OrderItemList; 