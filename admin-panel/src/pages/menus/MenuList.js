import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './MenuList.css';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useMenu } from '../../contexts/MenuContext';

const hardcodedCategories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Appetizer",
  "Dessert",
  "Beverage"
];

const MenuList = () => {
  const { menus, loading, error, fetchMenus, createMenu, updateMenu, deleteMenu } = useMenu();
  const [showModal, setShowModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formData, setFormData] = useState({
    menu_id: '',
    name: '',
    category: '',
    start_date: '',
    end_date: '',
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const getNextMenuId = () => {
    if (!menus.length) return 'menu-001';
    // Extract numbers from menu_id like "menu-004"
    const numbers = menus
      .map(menu => {
        const match = menu.menu_id && menu.menu_id.match(/^menu-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(num => num !== null);
    const max = numbers.length ? Math.max(...numbers) : 0;
    const next = (max + 1).toString().padStart(3, '0');
    return `menu-${next}`;
  };

  const handleShowModal = (menu = null) => {
    if (menu) {
      setSelectedMenu(menu);
      setFormData({
        menu_id: menu.menu_id,
        name: menu.name,
        category: menu.category,
        start_date: format(new Date(menu.start_date), "yyyy-MM-dd'T'HH:mm"),
        end_date: format(new Date(menu.end_date), "yyyy-MM-dd'T'HH:mm"),
      });
    } else {
      setSelectedMenu(null);
      setFormData({
        menu_id: getNextMenuId(),
        name: '',
        category: '',
        start_date: '',
        end_date: '',
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMenu(null);
    setFormData({
      menu_id: '',
      name: '',
      category: '',
      start_date: '',
      end_date: '',
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
      if (!formData.name || !formData.category || !formData.start_date || !formData.end_date) {
        setFormError('Please fill in all required fields');
        return;
      }
      const payload = {
        menu_id: formData.menu_id,
        name: formData.name,
        category: formData.category,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      if (selectedMenu) {
        await updateMenu(selectedMenu.menu_id, payload);
      } else {
        await createMenu(payload);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save menu');
    }
  };

  const handleDelete = (menuId) => {
    setMenuToDelete(menuId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (menuToDelete) {
      try {
        await deleteMenu(menuToDelete);
      } catch (err) {
        console.error('Error deleting menu:', err);
      }
    }
    setShowDeleteModal(false);
    setMenuToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMenuToDelete(null);
  };

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      'Breakfast': 'primary',
      'Lunch': 'success',
      'Dinner': 'info',
      'Appetizer': 'warning',
      'Dessert': 'danger',
      'Beverage': 'secondary'
    };
    return variants[category] || 'secondary';
  };

  const getStatusBadge = (menu) => {
    const now = new Date();
    const startDate = new Date(menu.start_date);
    const endDate = new Date(menu.end_date);
    
    if (now < startDate) return { variant: 'warning', text: 'Upcoming' };
    if (now > endDate) return { variant: 'secondary', text: 'Expired' };
    return { variant: 'success', text: 'Active' };
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading menus...</p>
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
              <i className="bi bi-menu-button-wide me-3 text-primary"></i>
              Menu Management
            </h1>
            <p className="page-subtitle">
              Organize and manage your restaurant's menu categories and schedules
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
              Create New Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary mb-4">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon stat-icon-primary">
              <i className="bi bi-menu-button-wide"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{menus.length}</div>
              <div className="stat-label">Total Menus</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-success">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {menus.filter(menu => {
                  const now = new Date();
                  const startDate = new Date(menu.start_date);
                  const endDate = new Date(menu.end_date);
                  return now >= startDate && now <= endDate;
                }).length}
              </div>
              <div className="stat-label">Active Menus</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon stat-icon-info">
              <i className="bi bi-collection"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{hardcodedCategories.length}</div>
              <div className="stat-label">Categories</div>
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
                Menu List
              </h5>
              <p className="text-muted mb-0">All available menu categories and their schedules</p>
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
                  <th>Menu ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="empty-state">
                        <i className="bi bi-menu-button-wide text-muted fs-1"></i>
                        <p className="mt-3 text-muted">No menus found</p>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowModal()}
                        >
                          Create First Menu
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  menus.map((menu) => {
                    const status = getStatusBadge(menu);
                    return (
                      <tr key={menu.menu_id} className="data-row">
                        <td>
                          <Button
                            variant="link"
                            className="p-0 text-decoration-none item-link"
                            onClick={() => navigate(`/menus/${menu.menu_id}`)}
                          >
                            <span className="item-id">{menu.menu_id}</span>
                          </Button>
                        </td>
                        <td>
                          <div className="menu-name">{menu.name}</div>
                        </td>
                        <td>
                          <Badge className={`menu-badge menu-badge-${getCategoryBadgeVariant(menu.category)}`}>
                            {menu.category}
                          </Badge>
                        </td>
                        <td>
                          <div className="menu-date">
                            {format(new Date(menu.start_date), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </td>
                        <td>
                          <div className="menu-date">
                            {format(new Date(menu.end_date), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </td>
                        <td>
                          <Badge className={`status-badge bg-${status.variant}`}>
                            {status.text}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(menu)}
                              className="action-btn edit-btn"
                              title="Edit Menu"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(menu.menu_id)}
                              className="action-btn delete-btn"
                              title="Delete Menu"
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

      {/* Add/Edit Menu Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className={`bi ${selectedMenu ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
            {selectedMenu ? 'Edit Menu' : 'Create New Menu'}
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
              <Form.Label className="form-label">Menu ID</Form.Label>
              <Form.Control
                type="text"
                name="menu_id"
                value={formData.menu_id}
                onChange={handleInputChange}
                required
                placeholder="Enter menu ID"
                className="form-control-modern"
                disabled={!!selectedMenu}
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Menu Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter menu name"
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="form-select-modern"
              >
                <option value="">Select a category</option>
                {hardcodedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Start Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">End Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
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
              <i className={`bi ${selectedMenu ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
              {selectedMenu ? 'Update Menu' : 'Create Menu'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Menu"
        message="Are you sure you want to delete this menu? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default MenuList; 