import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MenuList from './pages/menus/MenuList';
import MenuDetail from './pages/menus/MenuDetail';
import { MenuProvider } from './contexts/MenuContext';
import { FoodProvider } from './contexts/FoodContext';
import { TableProvider } from './contexts/TableContext';
import { OrderProvider } from './contexts/OrderContext';
import FoodList from './pages/foods/FoodList';
import FoodDetail from './pages/foods/FoodDetail';
import TableList from './pages/tables/TableList';
import TableDetail from './pages/tables/TableDetail';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import { OrderItemProvider } from './contexts/OrderItemContext';
import OrderItemList from './pages/orderItems/OrderItemList';
import OrderItemDetail from './pages/orderItems/OrderItemDetail';
import { InvoiceProvider } from './contexts/InvoiceContext';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import Profile from './pages/profile/Profile';

// Layout component for protected routes
const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-layout d-flex">
      <Sidebar
        isMobile={isMobile}
        show={showSidebarMobile}
        onHide={() => setShowSidebarMobile(false)}
      />
      <div className="flex-grow-1">
        <Navbar onToggleSidebar={() => setShowSidebarMobile(true)} />
        <main className="main-content bg-light min-vh-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <MenuProvider>
          <FoodProvider>
            <TableProvider>
              <OrderProvider>
                <OrderItemProvider>
                  <InvoiceProvider>
                    <Router>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                          <Route index element={<Navigate to="/dashboard" replace />} />
                          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                          <Route path="menus" element={<ProtectedRoute><MenuList /></ProtectedRoute>} />
                          <Route path="menus/:menuId" element={<ProtectedRoute><MenuDetail /></ProtectedRoute>} />
                          <Route path="foods" element={<ProtectedRoute><FoodList /></ProtectedRoute>} />
                          <Route path="foods/:foodId" element={<ProtectedRoute><FoodDetail /></ProtectedRoute>} />
                          <Route path="tables" element={<ProtectedRoute><TableList /></ProtectedRoute>} />
                          <Route path="tables/:tableId" element={<ProtectedRoute><TableDetail /></ProtectedRoute>} />
                          <Route path="orders" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
                          <Route path="orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                          <Route path="order-items" element={<ProtectedRoute><OrderItemList /></ProtectedRoute>} />
                          <Route path="order-items/:orderItemId" element={<ProtectedRoute><OrderItemDetail /></ProtectedRoute>} />
                          <Route path="invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
                          <Route path="invoices/:invoiceId" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
                        </Route>
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Router>
                  </InvoiceProvider>
                </OrderItemProvider>
              </OrderProvider>
            </TableProvider>
          </FoodProvider>
        </MenuProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
