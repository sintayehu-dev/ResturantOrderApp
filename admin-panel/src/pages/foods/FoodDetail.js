import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Badge, Row, Col, Modal, Form, InputGroup } from 'react-bootstrap';
import { useFood } from '../../contexts/FoodContext';
import { useMenu } from '../../contexts/MenuContext';
import { useAuth } from '../../contexts/AuthContext';

const FoodDetail = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { getFoodById, updateFood, deleteFood, loading, error } = useFood();
  const { menus, fetchMenus } = useMenu();
  const { user } = useAuth();
  const [food, setFood] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    food_image: '',
    menu_id: '',
  });
  const [formError, setFormError] = useState('');

  const isAdmin = user?.User_type === 'ADMIN';

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const data = await getFoodById(foodId);
        setFood(data);
        setFormData({
          name: data.name,
          price: data.price,
          food_image: data.food_image || '',
          menu_id: data.menu_id,
        });
      } catch (err) {
        console.error('Error fetching food details:', err);
      }
    };

    fetchFoodDetails();
    fetchMenus();
  }, [foodId, getFoodById, fetchMenus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If the input is price, ensure it's a valid number
    if (name === 'price') {
      const priceValue = parseFloat(value);
      if (value && !isNaN(priceValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: priceValue
        }));
      } else if (value === '') {
        // Allow empty value for price during typing
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormError('');
      
      // Validate form data
      if (!formData.name.trim()) {
        setFormError('Food name is required');
        return;
      }
      
      if (!formData.price || formData.price <= 0) {
        setFormError('Price must be greater than zero');
        return;
      }
      
      if (!formData.menu_id) {
        setFormError('Menu selection is required');
        return;
      }
      
      const payload = {
        food_id: food.food_id,
        name: formData.name,
        price: parseFloat(formData.price),
        food_image: formData.food_image,
        menu_id: formData.menu_id,
      };

      const updatedFood = await updateFood(foodId, payload);
      setFood(updatedFood);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update food item');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFood(foodId);
      navigate('/foods');
    } catch (err) {
      console.error('Error deleting food:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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

  if (!food) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Food item not found</Alert>
      </Container>
    );
  }

  const menuItem = menus.find(m => m.menu_id === food.menu_id);

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate('/foods')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Foods
          </Button>
          <h1 className="h3 mb-0">{food.name}</h1>
        </div>
        {isAdmin && (
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => setShowEditModal(true)}
            >
              <i className="bi bi-pencil me-2"></i>
              Edit Food
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash me-2"></i>
              Delete Food
            </Button>
          </div>
        )}
      </div>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Img 
              variant="top" 
              src={food.food_image || '/images/foods/default.jpg'} 
              alt={food.name}
              style={{ height: '300px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title mb-4">Food Details</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-tag text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Food ID</small>
                      <span className="fw-medium">{food.food_id}</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-currency-dollar text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Price</small>
                      <span className="fw-medium">{formatPrice(food.price)}</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-menu-button-wide text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Menu</small>
                      {menuItem ? (
                        <Badge bg="info" className="text-capitalize">
                          {menuItem.name}
                        </Badge>
                      ) : (
                        <Badge bg="secondary">No Menu</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-clock-history text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Last Updated</small>
                      <span className="fw-medium">
                        {new Date(food.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Food Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Food Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3">
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Food Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="food_image"
                value={formData.food_image}
                onChange={handleInputChange}
                placeholder="Enter image path or URL"
              />
              <Form.Text className="text-muted">
                Example: /images/foods/pizza.jpg
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Menu</Form.Label>
              <Form.Select
                name="menu_id"
                value={formData.menu_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a menu</option>
                {menus.map((menu) => (
                  <option key={menu.menu_id} value={menu.menu_id}>
                    {menu.name} ({menu.category})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)} className="d-flex align-items-center">
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="d-flex align-items-center">
              <i className="bi bi-check2-circle me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Food Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{food.name}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FoodDetail; 