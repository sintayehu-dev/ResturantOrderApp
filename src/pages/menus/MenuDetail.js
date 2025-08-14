import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Badge, Row, Col, Modal, Form } from 'react-bootstrap';
import { useMenu } from '../../contexts/MenuContext';
import { format } from 'date-fns';

const MenuDetail = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();
  const { getMenuById, updateMenu, deleteMenu, loading, error } = useMenu();
  const [menu, setMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    start_date: '',
    end_date: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const data = await getMenuById(menuId);
        setMenu(data);
        setFormData({
          name: data.name,
          category: data.category,
          start_date: format(new Date(data.start_date), "yyyy-MM-dd'T'HH:mm"),
          end_date: format(new Date(data.end_date), "yyyy-MM-dd'T'HH:mm"),
        });
      } catch (err) {
        console.error('Error fetching menu details:', err);
      }
    };

    fetchMenuDetails();
  }, [menuId, getMenuById]);

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

      const updatedMenu = await updateMenu(menuId, formData);
      setMenu(updatedMenu);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update menu');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMenu(menuId);
      navigate('/menus');
    } catch (err) {
      console.error('Error deleting menu:', err);
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

  if (!menu) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Menu not found</Alert>
      </Container>
    );
  }

  const now = new Date();
  const startDate = new Date(menu.start_date);
  const endDate = new Date(menu.end_date);
  const isActive = now >= startDate && now <= endDate;

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate('/menus')}
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Menus
          </Button>
          <h1 className="h3 mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            {menu.name}
            <Badge bg={isActive ? 'success' : 'secondary'} className="ms-2" style={{ fontSize: '65%', verticalAlign: 'middle' }}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
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
            Edit Menu
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-trash"></i>
            Delete Menu
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Menu Details</h5>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-tag text-primary"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '75%' }}>Menu ID</small>
                        <span className="fw-medium" style={{ fontSize: '78.75%' }}>{menu.menu_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-grid text-info"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '75%' }}>Category</small>
                        <Badge bg="info" className="text-capitalize" style={{ fontSize: '78.75%' }}>
                          {menu.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-calendar-check text-success"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '75%' }}>Start Date</small>
                        <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                          {format(new Date(menu.start_date), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-calendar-x text-danger"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '75%' }}>End Date</small>
                        <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                          {format(new Date(menu.end_date), 'MMM dd, yyyy HH:mm')}
                        </span>
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
                          {format(new Date(menu.created_at), 'MMM dd, yyyy HH:mm')}
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
                          {format(new Date(menu.updated_at), 'MMM dd, yyyy HH:mm')}
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
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '78.75%' }}
                >
                  <span>View Menu Items</span>
                  <i className="bi bi-list-ul"></i>
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '78.75%' }}
                >
                  <span>Export Menu</span>
                  <i className="bi bi-download"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Edit Menu</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3" style={{ fontSize: '78.75%' }}>
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Menu Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Start Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    style={{ fontSize: '78.75%' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>End Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    style={{ fontSize: '78.75%' }}
                  />
                </Form.Group>
              </Col>
            </Row>
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Delete Menu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '78.75%' }}>Are you sure you want to delete <strong>{menu.name}</strong>?</p>
          <p className="text-danger" style={{ fontSize: '78.75%' }}>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteModal(false)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%' }}
          >
            <i className="bi bi-x-circle"></i>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%' }}
          >
            <i className="bi bi-trash"></i>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MenuDetail; 