import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Row, Col, Modal, Form } from 'react-bootstrap';
import { useTable } from '../../contexts/TableContext';
import { useAuth } from '../../contexts/AuthContext';
import './TableList.css';

const TableDetail = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { getTableById, updateTable, deleteTable, loading, error } = useTable();
  const { user } = useAuth();
  const [table, setTable] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    table_name: '',
  });
  const [formError, setFormError] = useState('');

  const isAdmin = user?.User_type === 'ADMIN';

  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        const data = await getTableById(tableId);
        setTable(data);
        setFormData({
          table_name: data.table_name,
        });
      } catch (err) {
        console.error('Error fetching table details:', err);
      }
    };

    fetchTableDetails();
  }, [tableId, getTableById]);

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
      
      // Validate form data
      if (!formData.table_name.trim()) {
        setFormError('Table name is required');
        return;
      }
      
      const payload = {
        table_id: table.table_id,
        table_name: formData.table_name,
      };

      const updatedTable = await updateTable(tableId, payload);
      setTable(updatedTable);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update table');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTable(tableId);
      navigate('/tables');
    } catch (err) {
      console.error('Error deleting table:', err);
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

  if (!table) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Table not found</Alert>
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
            onClick={() => navigate('/tables')}
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Tables
          </Button>
          <h1 className="h3 mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            {table.table_name}
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
            Edit Table
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-trash"></i>
            Delete Table
          </Button>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Table Details</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-grid-3x3 text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Table ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{table.table_id}</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-card-text text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Table Name</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{table.table_name}</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-calendar-plus text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Created At</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                        {new Date(table.created_at).toLocaleString()}
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
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Last Updated</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>
                        {new Date(table.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Table Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Edit Table</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3" style={{ fontSize: '78.75%' }}>
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Table Name</Form.Label>
              <Form.Control
                type="text"
                name="table_name"
                value={formData.table_name}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              />
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Delete Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '78.75%' }}>Are you sure you want to delete <strong>{table.table_name}</strong>?</p>
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

export default TableDetail; 