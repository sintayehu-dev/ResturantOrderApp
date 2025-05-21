import React, { useState, useEffect } from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isMobile, show, onHide }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'bi bi-speedometer2'
    },
    {
      title: 'Foods',
      path: '/foods',
      icon: 'bi bi-egg-fried'
    },
    {
      title: 'Menus',
      path: '/menus',
      icon: 'bi bi-menu-button-wide'
    },
    {
      title: 'Tables',
      path: '/tables',
      icon: 'bi bi-grid-3x3'
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: 'bi bi-cart'
    },
    {
      title: 'Invoices',
      path: '/invoices',
      icon: 'bi bi-receipt'
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2">
              <i className="bi bi-shop text-primary fs-4"></i>
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-grow-1 ms-3">
              <h5 className="mb-0 text-white" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Restaurant Admin</h5>
              <small className="text-white-50" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Management System</small>
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        {!isCollapsed && (
          <div className="mb-3 px-3">
            <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Main Menu</small>
          </div>
        )}
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`d-flex align-items-center ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={isMobile ? onHide : undefined}
            >
              <i className={`${item.icon} ${isCollapsed ? 'mx-auto' : 'me-3'}`}></i>
              {!isCollapsed && <span style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{item.title}</span>}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      {!isCollapsed && (
        <div className="mt-auto p-3 border-top border-secondary">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                <i className="bi bi-gear-fill text-primary"></i>
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="mb-0 text-white" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Settings</h6>
              <small className="text-white-50" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Version 1.0.0</small>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Mobile version
  if (isMobile) {
    return (
      <Offcanvas
        show={show}
        onHide={onHide}
        placement="start"
        className="sidebar-mobile"
        style={{ width: '280px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>
    );
  }

  // Desktop version
  return (
    <div className={`sidebar d-flex flex-column ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <SidebarContent />
    </div>
  );
};

export default Sidebar; 