import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
            <i className="bi bi-shop text-primary"></i>
          </div>
          <span className="fw-bold text-primary d-none d-sm-inline" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Restaurant Admin</span>
        </Navbar.Brand>

        {/* Mobile Menu Toggle */}
        <Navbar.Toggle 
          aria-controls="offcanvasNavbar-expand-lg" 
          className="border-0 d-lg-none"
          onClick={() => setShowOffcanvas(true)}
        >
          <i className="bi bi-list fs-4"></i>
        </Navbar.Toggle>
        
        {/* Mobile Menu */}
        <Offcanvas
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
          placement="end"
          className="d-lg-none"
          id="offcanvasNavbar-expand-lg"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              <Nav.Link href="#notifications" className="d-flex align-items-center py-3" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                <i className="bi bi-bell fs-5 me-2"></i>
                Notifications
                <Badge 
                  bg="danger" 
                  className="ms-2 rounded-pill"
                  style={{ fontSize: '0.6rem', padding: '0.25rem 0.4rem' }}
                >
                  3
                </Badge>
              </Nav.Link>
              <Nav.Link href="#profile" className="d-flex align-items-center py-3" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                <i className="bi bi-person me-2"></i>
                Profile
              </Nav.Link>
              <Nav.Link href="#settings" className="d-flex align-items-center py-3" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                <i className="bi bi-gear me-2"></i>
                Settings
              </Nav.Link>
              <Nav.Link onClick={handleLogout} className="d-flex align-items-center py-3 text-danger" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
        
        {/* Desktop Menu */}
        <div className="d-none d-lg-flex align-items-center">
          <Nav className="me-3">
            <Nav.Link href="#notifications" className="position-relative p-2" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
              <i className="bi bi-bell fs-5"></i>
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: '0.6rem', padding: '0.25rem 0.4rem' }}
              >
                3
              </Badge>
            </Nav.Link>
          </Nav>

          <NavDropdown 
            title={
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <i className="bi bi-person-circle text-primary"></i>
                </div>
                <span style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{user?.name || 'Admin'}</span>
              </div>
            } 
            id="basic-nav-dropdown"
            align="end"
            className="custom-dropdown"
          >
            <div className="px-3 py-2 border-bottom">
              <h6 className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{user?.name || 'Admin User'}</h6>
              <small className="text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{user?.email || 'admin@example.com'}</small>
            </div>
            
            <NavDropdown.Item href="#profile" className="d-flex align-items-center" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
              <i className="bi bi-person me-2"></i>
              Profile
            </NavDropdown.Item>
            
            <NavDropdown.Item href="#settings" className="d-flex align-items-center" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
              <i className="bi bi-gear me-2"></i>
              Settings
            </NavDropdown.Item>
            
            <NavDropdown.Divider />
            
            <NavDropdown.Item onClick={handleLogout} className="d-flex align-items-center text-danger" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 