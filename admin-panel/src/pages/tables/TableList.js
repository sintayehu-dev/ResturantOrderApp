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
    <Container fluid className="p-4 table-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 page-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Table Management</h1>
        <Button variant="primary" onClick={() => handleShowModal()} className="action-button" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
          <i className="bi bi-plus-lg me-2"></i>
          Add New Table
        </Button>
      </div>

      <Card className="table-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle menu-table">
              <thead>
                <tr>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Table ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Name</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Created At</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Updated At</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.table_id}>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none table-link"
                        onClick={() => navigate(`/tables/${table.table_id}`)}
                      >
                        {table.table_id}
                      </Button>
                    </td>
                    <td className="table-item-text">{table.table_name}</td>
                    <td className="table-item-text">{new Date(table.created_at).toLocaleString()}</td>
                    <td className="table-item-text">{new Date(table.updated_at).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(table)}
                          className="action-icon-btn edit-btn"
                          style={{ fontSize: '78.75%' }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(table.table_id)}
                          className="action-icon-btn delete-btn"
                          style={{ fontSize: '78.75%' }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Table Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="table-modal">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            {selectedTable ? 'Edit Table' : 'Add New Table'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3" style={{ fontSize: '78.75%' }}>
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Table ID</Form.Label>
              <Form.Control
                type="text"
                name="table_id"
                value={formData.table_id}
                onChange={handleInputChange}
                required
                placeholder="Enter table ID"
                disabled={!!selectedTable}
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Table Name</Form.Label>
              <Form.Control
                type="text"
                name="table_name"
                value={formData.table_name}
                onChange={handleInputChange}
                required
                placeholder="Enter table name"
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal} className="cancel-button d-flex align-items-center" style={{ fontSize: '78.75%' }}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="submit-button d-flex align-items-center" style={{ fontSize: '78.75%' }}>
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
        message="Are you sure you want to delete this table?"
        confirmText="Yes"
        cancelText="No"
      />
    </Container>
  );
};

export default TableList; 