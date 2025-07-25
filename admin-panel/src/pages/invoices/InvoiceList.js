import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Modal, Form, Alert, InputGroup } from 'react-bootstrap';
import { useInvoice } from '../../contexts/InvoiceContext';
import { useOrder } from '../../contexts/OrderContext';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const { invoices, loading, error, fetchInvoices, createInvoice, updateInvoice, deleteInvoice, getNextInvoiceId } = useInvoice();
  const { orders, fetchOrders, getOrderById } = useOrder();
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoice_id: '',
    order_id: '',
    payment_method: '',
    payment_status: '',
    payment_due_date: '',
    total_amount: '',
  });
  const [formError, setFormError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, [fetchInvoices, fetchOrders]);

  const handleShowModal = async (invoice = null) => {
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData({
        invoice_id: invoice.invoice_id,
        order_id: invoice.order_id,
        payment_method: invoice.payment_method,
        payment_status: invoice.payment_status,
        payment_due_date: invoice.payment_due_date ? invoice.payment_due_date.slice(0, 16) : '',
        total_amount: invoice.total_amount,
      });
    } else {
      setSelectedInvoice(null);
      const nextInvoiceId = await getNextInvoiceId();
      setFormData({
        invoice_id: nextInvoiceId,
        order_id: '',
        payment_method: '',
        payment_status: 'pending',
        payment_due_date: '',
        total_amount: '',
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    setFormData({
      invoice_id: '',
      order_id: '',
      payment_method: '',
      payment_status: '',
      payment_due_date: '',
      total_amount: '',
    });
    setFormError('');
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If order_id changes, fetch order details and update total_amount
    if (name === 'order_id' && value) {
      try {
        const orderData = await getOrderById(value);
        if (orderData) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            total_amount: orderData.order_total || 0
          }));
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    // Basic validation
    if (!formData.invoice_id.trim()) {
      setFormError('Invoice ID is required');
      return;
    }
    if (!formData.order_id.trim()) {
      setFormError('Order ID is required');
      return;
    }
    if (!formData.payment_method.trim()) {
      setFormError('Payment method is required');
      return;
    }
    if (!formData.payment_status.trim()) {
      setFormError('Payment status is required');
      return;
    }
    if (!formData.payment_due_date) {
      setFormError('Payment due date is required');
      return;
    }
    if (!formData.total_amount || isNaN(formData.total_amount)) {
      setFormError('Total amount must be a number');
      return;
    }
    const payload = {
      invoice_id: formData.invoice_id,
      order_id: formData.order_id,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      payment_due_date: formData.payment_due_date,
      total_amount: parseFloat(formData.total_amount),
    };
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.invoice_id, payload);
      } else {
        await createInvoice(payload);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save invoice');
    }
  };

  const handleDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      try {
        await deleteInvoice(invoiceToDelete);
      } catch (err) {
        // Optionally handle error
      }
    }
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
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
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 page-title" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Invoice Management</h1>
        <Button variant="primary" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
          <i className="bi bi-plus-lg"></i>
          <span>Add New Invoice</span>
        </Button>
      </div>
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Invoice ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Order ID</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Payment Method</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Payment Status</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Payment Due Date</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Total Amount</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Created At</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Updated At</th>
                  <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invoice_id}>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none order-link"
                        onClick={() => {
                          console.log('Navigating to invoice:', invoice.invoice_id);
                          navigate(`/invoices/${invoice.invoice_id}`);
                        }}
                        style={{ fontSize: '78.75%', fontWeight: 'normal' }}
                      >
                        {invoice.invoice_id}
                      </Button>
                    </td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{invoice.order_id}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{invoice.payment_method}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{invoice.payment_status}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatDate(invoice.payment_due_date)}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{invoice.total_amount}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatDate(invoice.created_at)}</td>
                    <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatDate(invoice.updated_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(invoice)}
                          className="action-icon-btn edit-btn"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(invoice.invoice_id)}
                          className="action-icon-btn delete-btn"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      {/* Add/Edit Invoice Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>{selectedInvoice ? 'Edit Invoice' : 'Add New Invoice'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3">
                <p className="mb-0" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formError}</p>
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Invoice ID</Form.Label>
              <Form.Control
                type="text"
                name="invoice_id"
                value={formData.invoice_id}
                onChange={handleInputChange}
                required
                disabled={!!selectedInvoice}
                style={{ fontSize: '78.75%' }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '75%' }}>
                {selectedInvoice ? 'Invoice ID cannot be changed' : 'Auto-generated invoice ID'}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Order ID</Form.Label>
              <Form.Select
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              >
                <option value="">Select order</option>
                {orders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    {order.order_id} (Total: ${order.order_total})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Payment Method</Form.Label>
              <Form.Select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="mobile_payment">Mobile Payment</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Payment Status</Form.Label>
              <Form.Select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Payment Due Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="payment_due_date"
                value={formData.payment_due_date}
                onChange={handleInputChange}
                required
                style={{ fontSize: '78.75%' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '78.75%', fontWeight: '500' }}>Total Amount</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  required
                  style={{ fontSize: '78.75%' }}
                />
              </InputGroup>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal} className="d-flex align-items-center gap-2" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
              <i className="bi bi-x-circle"></i>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="d-flex align-items-center gap-2" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
              <i className={`bi ${selectedInvoice ? 'bi-check2-circle' : 'bi-plus-circle'}`}></i>
              {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Delete Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '78.75%' }}>Are you sure you want to delete this invoice?</p>
          <p className="text-danger" style={{ fontSize: '78.75%' }}>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={cancelDelete} style={{ fontSize: '78.75%' }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} style={{ fontSize: '78.75%' }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvoiceList; 