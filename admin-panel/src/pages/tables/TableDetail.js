import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Row, Col, Modal, Form } from 'react-bootstrap';
import { useTable } from '../../contexts/TableContext';
import './TableList.css';

const TableDetail = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { getTableById, updateTable, deleteTable, loading, error } = useTable();
  const [table, setTable] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    table_name: '',
  });
  const [formError, setFormError] = useState('');

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
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading table details...</p>
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

  if (!table) {
    return (
      <div className="page-container">
        <div className="error-state">
          <Alert variant="warning" className="error-alert">Table not found</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <Button
              variant="link"
              className="text-decoration-none p-0 mb-2 item-link"
              onClick={() => navigate('/tables')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Tables
            </Button>
            <h1 className="page-title">
              <i className="bi bi-grid-3x3 me-3 text-primary"></i>
              {table.table_name}
            </h1>
            <p className="page-subtitle">View and manage details for this table</p>
          </div>
          <div className="header-actions d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => setShowEditModal(true)}
              className="export-btn"
            >
              <i className="bi bi-pencil me-2"></i>
              Edit Table
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
              className="export-btn"
            >
              <i className="bi bi-trash me-2"></i>
              Delete Table
            </Button>
          </div>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="content-card">
            <Card.Header className="content-card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Table Details
              </h5>
            </Card.Header>
            <Card.Body>
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
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className="bi bi-pencil-square me-2 text-primary"></i>
            Edit Table
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
              <Form.Label className="form-label">Table Name</Form.Label>
              <Form.Control
                type="text"
                name="table_name"
                value={formData.table_name}
                onChange={handleInputChange}
                required
                className="form-control-modern"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowEditModal(false)} 
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
              <i className="bi bi-check2-circle me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className="bi bi-trash me-2 text-danger"></i>
            Delete Table
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Are you sure you want to delete <strong>{table.table_name}</strong>?</p>
          <p className="text-danger mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteModal(false)}
            className="cancel-btn"
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="submit-btn"
          >
            <i className="bi bi-trash me-2"></i>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TableDetail; 