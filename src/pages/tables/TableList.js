import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { useTable } from '../../contexts/TableContext';
import { useNavigate } from 'react-router-dom';
import './TableList.css';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TableList = () => {
  const { tables, loading, error, fetchTables, createTable, updateTable, deleteTable, getNextTableId } = useTable();
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    table_id: '',
    table_name: '',
  });
  const [formError, setFormError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleShowModal = async (table = null) => {
    if (table) {
      setSelectedTable(table);
      setFormData({
        table_id: table.table_id,
        table_name: table.table_name,
      });
    } else {
      setSelectedTable(null);
      const nextTableId = await getNextTableId();
      setFormData({
        table_id: nextTableId,
        table_name: '',
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTable(null);
    setFormData({
      table_id: '',
      table_name: '',
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
      
      // Validate form data
      if (!formData.table_name.trim()) {
        setFormError('Table name is required');
        return;
      }
      
      const payload = {
        table_id: formData.table_id,
        table_name: formData.table_name,
      };
      
      if (selectedTable) {
        await updateTable(selectedTable.table_id, payload);
      } else {
        await createTable(payload);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save table');
    }
  };

  const handleDelete = (tableId) => {
    setTableToDelete(tableId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (tableToDelete) {
      try {
        await deleteTable(tableToDelete);
      } catch (err) {
        console.error('Error deleting table:', err);
      }
    }
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading tables...</p>
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
              <i className="bi bi-grid-3x3 me-3 text-primary"></i>
              Table Management
            </h1>
            <p className="page-subtitle">Create, edit, and manage restaurant tables</p>
          </div>
          <div className="header-actions">
            <Button variant="primary" onClick={() => handleShowModal()} className="primary-action-btn" size="lg">
              <i className="bi bi-plus-lg me-2"></i>
              Add New Table
            </Button>
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
                Tables List
              </h5>
              <p className="text-muted mb-0">All tables with their creation and update timestamps</p>
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
                  <th>Table ID</th>
                  <th>Name</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="empty-state">
                        <i className="bi bi-grid-3x3 text-muted fs-1"></i>
                        <p className="mt-3 text-muted">No tables found</p>
                        <Button variant="outline-primary" size="sm" onClick={() => handleShowModal()}>
                          Create First Table
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tables.map((table) => (
                    <tr key={table.table_id} className="data-row">
                      <td>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none item-link"
                          onClick={() => navigate(`/tables/${table.table_id}`)}
                        >
                          <span className="item-id">{table.table_id}</span>
                        </Button>
                      </td>
                      <td className="table-item-text">{table.table_name}</td>
                      <td className="table-item-text">{new Date(table.created_at).toLocaleString()}</td>
                      <td className="table-item-text">{new Date(table.updated_at).toLocaleString()}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(table)}
                            className="action-btn edit-btn"
                            title="Edit Table"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(table.table_id)}
                            className="action-btn delete-btn"
                            title="Delete Table"
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

      {/* Add/Edit Table Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            <i className={`bi ${selectedTable ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
            {selectedTable ? 'Edit Table' : 'Add New Table'}
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
              <Form.Label className="form-label">Table ID</Form.Label>
              <Form.Control
                type="text"
                name="table_id"
                value={formData.table_id}
                onChange={handleInputChange}
                required
                placeholder="Enter table ID"
                disabled={!!selectedTable}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Table Name</Form.Label>
              <Form.Control
                type="text"
                name="table_name"
                value={formData.table_name}
                onChange={handleInputChange}
                required
                placeholder="Enter table name"
                className="form-control-modern"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button variant="outline-secondary" onClick={handleCloseModal} className="cancel-btn">
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="submit-btn">
              <i className={`bi ${selectedTable ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
              {selectedTable ? 'Update Table' : 'Create Table'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onHide={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Table"
        message="Are you sure you want to delete this table? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default TableList; 