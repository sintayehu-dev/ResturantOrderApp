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
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

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
    setImageUploaded(false);
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
    if (file) {
      setImageUploading(true);
      setImageUploaded(false);
      try {
        const imageUrl = await uploadFoodImage(file); // Uploads to backend/Cloudinary
        setFormData(prev => ({
          ...prev,
          food_image: imageUrl
        }));
        setImageUploaded(true);
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
      // For new food items, require an image. For editing, allow keeping existing image
      if (!selectedFood && !formData.food_image) {
        setFormError('Please upload an image before submitting.');
        return;
      }
      if (selectedFood && !formData.food_image) {
        setFormError('Please upload an image or keep the existing one.');
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
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading food items...</p>
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
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <i className="bi bi-egg-fried me-3 text-primary"></i>
              Food Management
            </h1>
            <p className="page-subtitle">
              Manage your restaurant's food items, prices, and menu assignments
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
              Add New Food
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary mb-4">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon stat-icon-primary">
              <i className="bi bi-egg-fried"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{foods.length}</div>
              <div className="stat-label">Total Food Items</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-success">
              <i className="bi bi-menu-button-wide"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{menus.length}</div>
              <div className="stat-label">Available Menus</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-info">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {formatPrice(foods.reduce((total, food) => total + (parseFloat(food.price) || 0), 0))}
              </div>
              <div className="stat-label">Total Value</div>
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
                Food Items List
              </h5>
              <p className="text-muted mb-0">All available food items in your restaurant</p>
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
                  <th>Food ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Menu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="empty-state">
                        <i className="bi bi-egg-fried text-muted fs-1"></i>
                        <p className="mt-3 text-muted">No food items found</p>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowModal()}
                        >
                          Add First Food Item
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  foods.map((food) => {
                    const menuItem = menus.find(menu => menu.menu_id === food.menu_id);
                    
                    return (
                      <tr key={food.food_id} className="data-row">
                        <td>
                          <Button
                            variant="link"
                            className="p-0 text-decoration-none item-link"
                            onClick={() => navigate(`/foods/${food.food_id}`)}
                          >
                            <span className="item-id">#{food.food_id}</span>
                          </Button>
                        </td>
                        <td>
                          <div className="food-image-wrapper">
                            <img 
                              src={food.food_image || '/images/foods/default.jpg'} 
                              alt={food.name}
                              className="food-image"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="food-name">{food.name}</div>
                        </td>
                        <td>
                          <div className="food-price">{formatPrice(food.price)}</div>
                        </td>
                        <td>
                          {menuItem ? (
                            <Badge className="menu-badge menu-badge-info">
                              {menuItem.name}
                            </Badge>
                          ) : (
                            <Badge className="menu-badge menu-badge-secondary">
                              No Menu
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(food)}
                              className="action-btn edit-btn"
                              title="Edit Food Item"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(food.food_id)}
                              className="action-btn delete-btn"
                              title="Delete Food Item"
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

      {/* Add/Edit Food Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className={`bi ${selectedFood ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
            {selectedFood ? 'Edit Food Item' : 'Add New Food Item'}
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
              <Form.Label className="form-label">Food ID</Form.Label>
              <Form.Control
                type="text"
                name="food_id"
                value={formData.food_id}
                onChange={handleInputChange}
                required
                placeholder="Enter food ID"
                className="form-control-modern"
                disabled={!!selectedFood}
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Food Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter food name"
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Price</Form.Label>
              <InputGroup className="input-group-modern">
                <InputGroup.Text className="input-group-text-modern">$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                  className="form-control-modern"
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Food Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!selectedFood}
                disabled={imageUploading}
                className="form-control-modern file-input"
              />
              <Form.Text className="form-text-modern">
                {selectedFood ? 'Upload a new image or keep the existing one' : 'Upload a food image (jpg, png, etc.)'}
              </Form.Text>
              
              {imageUploading && (
                <div className="upload-status uploading">
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Uploading image...
                </div>
              )}
              
              {imageUploaded && (
                <div className="upload-status success">
                  <i className="bi bi-check-circle"></i>
                  Image uploaded successfully!
                </div>
              )}
              
              {formData.food_image && !imageUploading && (
                <div className="image-preview">
                  <img
                    src={formData.food_image}
                    alt="Preview"
                    className="preview-image"
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Menu Category</Form.Label>
              <Form.Select
                name="menu_id"
                value={formData.menu_id}
                onChange={handleInputChange}
                required
                className="form-select-modern"
              >
                <option value="">Select a menu category</option>
                {menus.map((menu) => (
                  <option key={menu.menu_id} value={menu.menu_id}>
                    {menu.name} ({menu.category})
                  </option>
                ))}
              </Form.Select>
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
        title="Delete Food Item"
        message="Are you sure you want to delete this food item? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default FoodList; 