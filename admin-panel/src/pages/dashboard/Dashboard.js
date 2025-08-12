import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
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
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero mb-4">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome back, <span className="text-gradient">{user?.name || 'Admin'}</span>! 👋
            </h1>
            <p className="hero-subtitle">
              Here's what's happening with your restaurant today. Stay on top of orders, revenue, and table management.
            </p>
          </div>
          <div className="hero-actions">
            <Button 
              variant="outline-primary" 
              className="hero-btn hero-btn-outline"
              size="lg"
            >
              <i className="bi bi-download me-2"></i>
              Export Report
            </Button>
            <Button 
              variant="primary" 
              className="hero-btn hero-btn-primary"
              size="lg"
              onClick={handleNewOrder}
            >
              <i className="bi bi-plus-lg me-2"></i>
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        {/* Total Orders Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card stat-card-primary h-100">
            <Card.Body className="p-4">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-primary">
                  <i className="bi bi-cart-check"></i>
                </div>
                <div className="stat-trend stat-trend-up">
                  <i className="bi bi-arrow-up"></i>
                  <span>12%</span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{orders?.length || 0}</h3>
                <p className="stat-label">Total Orders</p>
                <div className="stat-meta">
                  <span className="stat-period">vs last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Revenue Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card stat-card-success h-100">
            <Card.Body className="p-4">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-success">
                  <i className="bi bi-currency-dollar"></i>
                </div>
                <div className="stat-trend stat-trend-up">
                  <i className="bi bi-arrow-up"></i>
                  <span>8%</span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">
                  {formatPrice(orders?.reduce((total, order) => total + (parseFloat(order.order_total) || 0), 0) || 0)}
                </h3>
                <p className="stat-label">Total Revenue</p>
                <div className="stat-meta">
                  <span className="stat-period">vs last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Active Tables Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card stat-card-info h-100">
            <Card.Body className="p-4">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-info">
                  <i className="bi bi-grid-3x3-gap"></i>
                </div>
                <div className="stat-trend stat-trend-live">
                  <i className="bi bi-circle-fill"></i>
                  <span>Live</span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">8/12</h3>
                <p className="stat-label">Active Tables</p>
                <div className="stat-meta">
                  <span className="stat-period">Updated just now</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Average Order Value Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card stat-card-warning h-100">
            <Card.Body className="p-4">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-warning">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="stat-trend stat-trend-up">
                  <i className="bi bi-arrow-up"></i>
                  <span>15%</span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">
                  {orders?.length > 0 
                    ? formatPrice(orders.reduce((total, order) => total + (parseFloat(order.order_total) || 0), 0) / orders.length)
                    : '$0.00'
                  }
                </h3>
                <p className="stat-label">Avg Order Value</p>
                <div className="stat-meta">
                  <span className="stat-period">vs last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row className="g-4">
        {/* Recent Orders */}
        <Col lg={8}>
          <Card className="content-card h-100">
            <Card.Header className="content-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="header-content">
                  <h5 className="card-title mb-1">
                    <i className="bi bi-clock-history me-2 text-primary"></i>
                    Recent Orders
                  </h5>
                  <p className="text-muted mb-0">Latest 5 orders from your restaurant</p>
                </div>
                <Button 
                  variant="link" 
                  className="view-all-btn"
                  onClick={() => navigate('/orders')}
                >
                  View All
                  <i className="bi bi-arrow-right ms-1"></i>
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 modern-table">
                  <thead className="table-header">
                    <tr>
                      <th>Order ID</th>
                      <th className="d-none d-md-table-cell">Table</th>
                      <th>Date</th>
                      <th className="d-none d-md-table-cell">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="loading-spinner">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading orders...</p>
                          </div>
                        </td>
                      </tr>
                    ) : recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr 
                          key={order.order_id} 
                          className="order-row"
                          onClick={() => navigate(`/orders/${order.order_id}`)}
                        >
                          <td>
                            <div className="order-id">
                              <span className="order-number">#{order.order_id}</span>
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <div className="table-info">
                              <i className="bi bi-grid-3x3 me-2 text-muted"></i>
                              Table {order.table_id}
                            </div>
                          </td>
                          <td>
                            <div className="order-date">
                              {formatDate(order.created_at)}
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <div className="order-amount">
                              <span className="amount-text">{formatPrice(order.order_total)}</span>
                            </div>
                          </td>
                          <td>
                            <Badge className={`status-badge ${getStatusBadge(order.order_status)}`}>
                              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="empty-state">
                            <i className="bi bi-inbox text-muted fs-1"></i>
                            <p className="mt-3 text-muted">No recent orders found</p>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={handleNewOrder}
                            >
                              Create First Order
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions & Insights */}
        <Col lg={4}>
          <div className="d-flex flex-column gap-4">
            {/* Quick Actions */}
            <Card className="content-card">
              <Card.Header className="content-card-header">
                <h5 className="card-title mb-1">
                  <i className="bi bi-lightning me-2 text-warning"></i>
                  Quick Actions
                </h5>
                <p className="text-muted mb-0">Common tasks and shortcuts</p>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="quick-actions-grid">
                  <Button 
                    variant="outline-primary" 
                    className="quick-action-btn"
                    onClick={handleNewOrder}
                  >
                    <div className="action-icon">
                      <i className="bi bi-plus-circle"></i>
                    </div>
                    <span>New Order</span>
                  </Button>
                  <Button variant="outline-success" className="quick-action-btn">
                    <div className="action-icon">
                      <i className="bi bi-grid-3x3"></i>
                    </div>
                    <span>Manage Tables</span>
                  </Button>
                  <Button variant="outline-info" className="quick-action-btn">
                    <div className="action-icon">
                      <i className="bi bi-graph-up"></i>
                    </div>
                    <span>View Reports</span>
                  </Button>
                  <Button variant="outline-warning" className="quick-action-btn">
                    <div className="action-icon">
                      <i className="bi bi-calendar3"></i>
                    </div>
                    <span>Staff Schedule</span>
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Today's Summary */}
            <Card className="content-card">
              <Card.Header className="content-card-header">
                <h5 className="card-title mb-1">
                  <i className="bi bi-calendar-check me-2 text-success"></i>
                  Today's Summary
                </h5>
                <p className="text-muted mb-0">Key metrics for today</p>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="summary-stats">
                  <div className="summary-item">
                    <div className="summary-label">Orders Today</div>
                    <div className="summary-value">{orders?.filter(o => {
                      const today = new Date().toDateString();
                      return new Date(o.created_at).toDateString() === today;
                    }).length || 0}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Revenue Today</div>
                    <div className="summary-value">
                      {formatPrice(orders?.filter(o => {
                        const today = new Date().toDateString();
                        return new Date(o.created_at).toDateString() === today;
                      }).reduce((total, order) => total + (parseFloat(order.order_total) || 0), 0) || 0)}
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Pending Orders</div>
                    <div className="summary-value">
                      {orders?.filter(o => o.order_status?.toLowerCase() === 'pending').length || 0}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 