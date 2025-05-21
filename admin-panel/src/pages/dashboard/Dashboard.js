import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useOrder } from '../../contexts/OrderContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders, fetchOrders, loading } = useOrder();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    // Get only the most recent 5 orders
    if (orders && orders.length > 0) {
      const sortedOrders = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentOrders(sortedOrders);
    }
  }, [orders]);

  const handleNewOrder = () => {
    navigate('/orders', { state: { openCreateModal: true } });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    let badgeClass = '';
    
    switch(status.toLowerCase()) {
      case 'pending':
        badgeClass = 'bg-warning';
        break;
      case 'preparing':
        badgeClass = 'bg-info';
        break;
      case 'ready':
        badgeClass = 'bg-primary';
        break;
      case 'completed':
        badgeClass = 'bg-success';
        break;
      case 'cancelled':
        badgeClass = 'bg-danger';
        break;
      default:
        badgeClass = 'bg-secondary';
    }
    
    return badgeClass;
  };

  return (
    <Container fluid className="p-3 p-md-4 fade-in">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 mb-1" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Welcome back, {user?.name || 'Admin'}!</h1>
          <p className="text-muted mb-0" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Here's what's happening with your restaurant today.</p>
        </div>
        <div className="d-flex gap-2 w-100 w-md-auto">
          <Button variant="outline-primary" className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0">
            <i className="bi bi-download"></i>
            <span className="d-none d-sm-inline" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Export Report</span>
          </Button>
          <Button 
            variant="primary" 
            className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0"
            onClick={handleNewOrder}
          >
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>New Order</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 g-md-4 mb-4">
        {/* Total Orders Card */}
        <Col xs={12} sm={6} md={4}>
          <div className="dashboard-card bg-primary text-white h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="card-title mb-1" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Total Orders</h6>
                  <h2 className="display-6 display-md-4 mb-0" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>{orders?.length || 0}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-2 p-md-3">
                  <i className="bi bi-cart text-white fs-4"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-white bg-opacity-20 me-2">
                  <i className="bi bi-arrow-up me-1"></i>
                  {/* Placeholder - could calculate from actual data */}
                  12%
                </span>
                <small className="text-white-50" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>from last month</small>
              </div>
            </div>
          </div>
        </Col>

        {/* Revenue Card */}
        <Col xs={12} sm={6} md={4}>
          <div className="dashboard-card bg-success text-white h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="card-title mb-1" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Revenue</h6>
                  <h2 className="display-6 display-md-4 mb-0" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
                    {formatPrice(orders?.reduce((total, order) => total + (parseFloat(order.order_total) || 0), 0) || 0)}
                  </h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-2 p-md-3">
                  <i className="bi bi-currency-dollar text-white fs-4"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-white bg-opacity-20 me-2">
                  <i className="bi bi-arrow-up me-1"></i>
                  8%
                </span>
                <small className="text-white-50" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>from last month</small>
              </div>
            </div>
          </div>
        </Col>

        {/* Active Tables Card */}
        <Col xs={12} sm={6} md={4}>
          <div className="dashboard-card bg-info text-white h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="card-title mb-1" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Active Tables</h6>
                  <h2 className="display-6 display-md-4 mb-0" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>8/12</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-2 p-md-3">
                  <i className="bi bi-grid-3x3 text-white fs-4"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-white bg-opacity-20 me-2">
                  <i className="bi bi-clock me-1"></i>
                  Live
                </span>
                <small className="text-white-50" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>Updated just now</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="g-3 g-md-4">
        {/* Recent Orders */}
        <Col lg={8}>
          <Card className="h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0" style={{ fontSize: '78.75%', fontWeight: '500' }}>Recent Orders</h5>
                <Button 
                  variant="link" 
                  className="text-decoration-none p-0" 
                  style={{ fontSize: '78.75%', fontWeight: 'bold' }}
                  onClick={() => navigate('/orders')}
                >
                  View All
                </Button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Order ID</th>
                      <th className="d-none d-md-table-cell" style={{ fontSize: '78.75%', fontWeight: '500' }}>Table</th>
                      <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Date</th>
                      <th className="d-none d-md-table-cell" style={{ fontSize: '78.75%', fontWeight: '500' }}>Amount</th>
                      <th style={{ fontSize: '78.75%', fontWeight: '500' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.order_id} style={{cursor: 'pointer'}} onClick={() => navigate(`/orders/${order.order_id}`)}>
                          <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{order.order_id}</td>
                          <td className="d-none d-md-table-cell" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{order.table_id}</td>
                          <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatDate(order.created_at)}</td>
                          <td className="d-none d-md-table-cell" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>{formatPrice(order.order_total)}</td>
                          <td style={{ fontSize: '78.75%', fontWeight: 'normal' }}>
                            <span className={`badge ${getStatusBadge(order.order_status)}`}>
                              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-3" style={{ fontSize: '78.75%', fontWeight: 'normal' }}>
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Body className="p-3 p-md-4">
              <h5 className="card-title mb-4" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Quick Actions</h5>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center justify-content-between" 
                  style={{ fontSize: '86.625%', fontWeight: 'bold' }}
                  onClick={handleNewOrder}
                >
                  <span style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Create New Order</span>
                  <i className="bi bi-plus-lg"></i>
                </Button>
                <Button variant="outline-primary" className="d-flex align-items-center justify-content-between" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Manage Tables</span>
                  <i className="bi bi-grid-3x3"></i>
                </Button>
                <Button variant="outline-primary" className="d-flex align-items-center justify-content-between" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '86.625%', fontWeight: 'bold' }}>View Reports</span>
                  <i className="bi bi-graph-up"></i>
                </Button>
                <Button variant="outline-primary" className="d-flex align-items-center justify-content-between" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Staff Schedule</span>
                  <i className="bi bi-calendar3"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 