import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useMenu } from '../../contexts/MenuContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './MenuList.css';

const MenuList = () => {
  const { menus, categories, loading, error, fetchMenus, fetchCategories, createMenu, updateMenu, deleteMenu } = useMenu();
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

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, [fetchMenus, fetchCategories]);

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
      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        setFormError('End date must be after start date');
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

  const handleDelete = async (menuId) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        await deleteMenu(menuId);
      } catch (err) {
        console.error('Error deleting menu:', err);
      }
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
    <Container fluid className="p-4 menu-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 page-title">Menu Management</h1>
        <Button variant="primary" onClick={() => handleShowModal()} className="action-button">
            <i className="bi bi-plus-lg me-2"></i>
            Add New Menu
          </Button>
      </div>

      <Card className="menu-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle menu-table">
              <thead>
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
                {menus.map((menu) => {
                  const now = new Date();
                  const startDate = new Date(menu.start_date);
                  const endDate = new Date(menu.end_date);
                  const isActive = now >= startDate && now <= endDate;

                  return (
                    <tr key={menu.menu_id}>
                      <td>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none menu-link"
                          onClick={() => navigate(`/menus/${menu.menu_id}`)}
                        >
                          {menu.menu_id}
                        </Button>
                      </td>
                      <td className="menu-item-text">{menu.name}</td>
                      <td>
                        <Badge bg="info" className="text-capitalize category-badge">
                          {menu.category}
                        </Badge>
                      </td>
                      <td className="menu-item-text">{format(new Date(menu.start_date), 'MMM dd, yyyy HH:mm')}</td>
                      <td className="menu-item-text">{format(new Date(menu.end_date), 'MMM dd, yyyy HH:mm')}</td>
                      <td>
                        <Badge bg={isActive ? 'success' : 'secondary'} className="status-badge">
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(menu)}
                              className="action-icon-btn edit-btn"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(menu.menu_id)}
                              className="action-icon-btn delete-btn"
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

      {/* Add/Edit Menu Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="menu-modal">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            {selectedMenu ? 'Edit Menu' : 'Add New Menu'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3 form-error">
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Menu ID</Form.Label>
              <Form.Control
                type="text"
                name="menu_id"
                value={formData.menu_id}
                onChange={handleInputChange}
                required
                placeholder="Enter menu ID"
                className="form-input"
                disabled={!!selectedMenu}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Menu Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter menu name"
                className="form-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Start Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">End Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal} className="cancel-button d-flex align-items-center">
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="submit-button d-flex align-items-center">
              <i className={`bi ${selectedMenu ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
              {selectedMenu ? 'Update Menu' : 'Create Menu'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MenuList; 