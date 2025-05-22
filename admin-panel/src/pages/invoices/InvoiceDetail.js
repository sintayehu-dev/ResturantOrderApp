import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Row, Col, Modal, Form, InputGroup, Badge } from 'react-bootstrap';
import { useInvoice } from '../../contexts/InvoiceContext';
import { useOrder } from '../../contexts/OrderContext';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { getInvoiceById, updateInvoice, deleteInvoice, loading, error } = useInvoice();
  const { orders, fetchOrders, getOrderById } = useOrder();
  const [invoice, setInvoice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    payment_method: '',
    payment_status: '',
    payment_due_date: '',
    total_amount: '',
  });
  const [formError, setFormError] = useState('');

  console.log('InvoiceDetail mounted, invoiceId:', invoiceId);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      console.log('Fetching invoice details for ID:', invoiceId);
      try {
        const data = await getInvoiceById(invoiceId);
        console.log('Received invoice data:', data);
        setInvoice(data);
        setFormData({
          order_id: data.order_id,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          payment_due_date: data.payment_due_date ? data.payment_due_date.slice(0, 16) : '',
          total_amount: data.total_amount,
        });
      } catch (err) {
        console.error('Error fetching invoice:', err);
        // error handled by context
      }
    };
    fetchInvoiceDetails();
    fetchOrders();
  }, [invoiceId, getInvoiceById, fetchOrders]);

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
      invoice_id: invoice.invoice_id,
      order_id: formData.order_id,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      payment_due_date: formData.payment_due_date,
      total_amount: parseFloat(formData.total_amount),
    };
    try {
      const updated = await updateInvoice(invoiceId, payload);
      setInvoice(updated);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update invoice');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoiceId);
      navigate('/invoices');
    } catch (err) {
      // error handled by context
    }
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

  if (!invoice) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Invoice not found</Alert>
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
            onClick={() => navigate('/invoices')}
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Invoices
          </Button>
          <h1 className="h3 mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
            Invoice {invoice.invoice_id}
            <Badge bg={invoice.payment_status === 'paid' ? 'success' : invoice.payment_status === 'pending' ? 'warning' : 'danger'} className="ms-2">
              {invoice.payment_status}
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
            Edit Invoice
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: '78.75%', fontWeight: 'bold' }}
          >
            <i className="bi bi-trash"></i>
            Delete Invoice
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Invoice Details</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-receipt text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Invoice ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{invoice.invoice_id}</span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-card-list text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Order ID</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{invoice.order_id}</span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-credit-card text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Payment Method</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{invoice.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-cash-coin text-warning"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Payment Status</small>
                      <Badge bg={invoice.payment_status === 'paid' ? 'success' : invoice.payment_status === 'pending' ? 'warning' : 'danger'}>
                        {invoice.payment_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-calendar-event text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Payment Due Date</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{formatDate(invoice.payment_due_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-currency-dollar text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '75%' }}>Total Amount</small>
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>${invoice.total_amount}</span>
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
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{formatDate(invoice.created_at)}</span>
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
                      <span className="fw-medium" style={{ fontSize: '78.75%' }}>{formatDate(invoice.updated_at)}</span>
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
                  <span>View Order Details</span>
                  <i className="bi bi-box-arrow-up-right"></i>
                </Button>
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '78.75%' }}
                >
                  <span>Download Invoice</span>
                  <i className="bi bi-download"></i>
                </Button>
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '78.75%' }}
                >
                  <span>Print Invoice</span>
                  <i className="bi bi-printer"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Invoice Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Edit Invoice</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="mb-3" style={{ fontSize: '78.75%' }}>
                {formError}
              </Alert>
            )}
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
          <Modal.Title style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Delete Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '78.75%' }}>Are you sure you want to delete this invoice?</p>
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

export default InvoiceDetail; 