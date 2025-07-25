import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Badge, Modal, Form, Alert, InputGroup } from 'react-bootstrap';
import { useFood } from '../../contexts/FoodContext';
import { useMenu } from '../../contexts/MenuContext';
import { useNavigate } from 'react-router-dom';
import './FoodList.css'; // Reusing the same CSS for consistency
import ConfirmDialog from '../../components/common/ConfirmDialog';

const FoodList = () => {
  const { foods, loading, error, fetchFoods, createFood, updateFood, deleteFood, getNextFoodId, uploadFoodImage } = useFood();
  const { menus, fetchMenus } = useMenu();
  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState({
    food_id: '',
    name: '',
    price: '',
    food_image: '',
    menu_id: '',
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchFoods();
    fetchMenus();
  }, [fetchFoods, fetchMenus]);

  const handleShowModal = async (food = null) => {
    if (food) {
      setSelectedFood(food);
      setFormData({
        food_id: food.food_id,
        name: food.name,
        price: food.price,
        food_image: food.food_image || '',
        menu_id: food.menu_id,
      });
    } else {
      setSelectedFood(null);
      const nextFoodId = await getNextFoodId();
      setFormData({
        food_id: nextFoodId,
        name: '',
        price: '',
        food_image: '',
        menu_id: '',
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFood(null);
    setFormData({
      food_id: '',
      name: '',
      price: '',
      food_image: '',
      menu_id: '',
    });
    setFormError('');
  };

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    if (file) {
      setImageUploading(true);
      try {
        const imageUrl = await uploadFoodImage(file); // Uploads to backend/Cloudinary
        setFormData(prev => ({
          ...prev,
          food_image: imageUrl
        }));
      } catch (err) {
        setFormError('Image upload failed: ' + (err.message || 'Unknown error'));
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormError('');
      if (parseFloat(formData.price) < 0) {
        setFormError('Price must be a positive number');
        return;
      }
      if (!formData.name || !formData.menu_id) {
        setFormError('Please fill in all required fields');
        return;
      }
      if (!formData.food_image) {
        setFormError('Please upload an image before submitting.');
        return;
      }
      const payload = {
        food_id: formData.food_id,
        name: formData.name,
        price: parseFloat(formData.price),
        food_image: formData.food_image, // Already Cloudinary URL
        menu_id: formData.menu_id,
      };
      if (selectedFood) {
        await updateFood(selectedFood.food_id, payload);
      } else {
        await createFood(payload);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save food item');
    }
  };

  const handleDelete = (foodId) => {
    setFoodToDelete(foodId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (foodToDelete) {
      try {
        await deleteFood(foodToDelete);
      } catch (err) {
        console.error('Error deleting food:', err);
      }
    }
    setShowDeleteModal(false);
    setFoodToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFoodToDelete(null);
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

  return (
    <Container fluid className="p-4 menu-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 page-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Food Management</h1>
        <Button variant="primary" onClick={() => handleShowModal()} className="action-button" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
          <i className="bi bi-plus-lg me-2"></i>
          Add New Food
        </Button>
      </div>

      <Card className="menu-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle menu-table">
              <thead>
                <tr>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Food ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Image</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Name</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Price</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Menu</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => {
                  const menuItem = menus.find(menu => menu.menu_id === food.menu_id);
                  
                  return (
                    <tr key={food.food_id}>
                      <td>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none menu-link"
                          onClick={() => navigate(`/foods/${food.food_id}`)}
                        >
                          {food.food_id}
                        </Button>
                      </td>
                      <td>
                        <img 
                          src={food.food_image || '/images/foods/default.jpg'} 
                          alt={food.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td className="menu-item-text">{food.name}</td>
                      <td className="menu-item-text">{formatPrice(food.price)}</td>
                      <td>
                        {menuItem ? (
                          <Badge bg="info" className="text-capitalize category-badge">
                            {menuItem.name}
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="category-badge">
                            No Menu
                          </Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(food)}
                            className="action-icon-btn edit-btn"
                            style={{ fontSize: '78.75%' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(food.food_id)}
                            className="action-icon-btn delete-btn"
                            style={{ fontSize: '78.75%' }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Food Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="menu-modal">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            {selectedFood ? 'Edit Food Item' : 'Add New Food Item'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3 form-error" style={{ fontSize: '78.75%' }}>
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="form-label" style={{ fontSize: '78.75%', fontWeight: '500' }}>Food ID</Form.Label>
              <Form.Control
                type="text"
                name="food_id"
                value={formData.food_id}
                onChange={handleInputChange}
                required
                placeholder="Enter food ID"
                className="form-input"
                disabled={!!selectedFood}
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label" style={{ fontSize: '78.75%', fontWeight: '500' }}>Food Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter food name"
                className="form-input"
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label" style={{ fontSize: '78.75%', fontWeight: '500' }}>Price</Form.Label>
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
                  placeholder="0.00"
                  className="form-input"
                  style={{ fontSize: '78.75%' }}
                />
              </InputGroup>
            </Form.Group>

            {/* Remove the text input for Image URL and keep only the file input */}
            <Form.Group className="mb-3">
              <Form.Label>Image File</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!selectedFood}
                disabled={imageUploading}
              />
              <Form.Text className="text-muted">
                Upload a food image (jpg, png, etc.)
              </Form.Text>
              {imageUploading && (
                <div style={{ marginTop: '10px', color: 'blue' }}>
                  Uploading image...
                </div>
              )}
              {formData.food_image && !imageUploading && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={formData.food_image}
                    alt="Preview"
                    style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }}
                  />
                  <div style={{ marginTop: '5px', fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                    <strong>Image URL:</strong> {formData.food_image}
                  </div>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label" style={{ fontSize: '78.75%', fontWeight: '500' }}>Menu</Form.Label>
              <Form.Select
                name="menu_id"
                value={formData.menu_id}
                onChange={handleInputChange}
                required
                className="form-select"
                style={{ fontSize: '78.75%' }}
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
            <Button variant="outline-secondary" onClick={handleCloseModal} className="cancel-button d-flex align-items-center" style={{ fontSize: '78.75%' }}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="submit-button d-flex align-items-center" style={{ fontSize: '78.75%' }}>
              <i className={`bi ${selectedFood ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
              {selectedFood ? 'Update Food Item' : 'Create Food Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Food"
        message="Are you sure you want to delete this food item?"
        confirmText="Yes"
        cancelText="No"
      />
    </Container>
  );
};

export default FoodList; 