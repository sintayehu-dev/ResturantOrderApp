import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MenuList from './pages/menus/MenuList';
import MenuDetail from './pages/menus/MenuDetail';
import { MenuProvider } from './contexts/MenuContext';

// Layout component for protected routes
const DashboardLayout = ({ children }) => (
  <div className="d-flex">
    <Sidebar />
    <div className="flex-grow-1">
      <Navbar />
      <main className="bg-light min-vh-100">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Menu Routes */}
          <Route
            path="/menus"
            element={
              <ProtectedRoute>
                <MenuProvider>
                  <DashboardLayout>
                    <MenuList />
                  </DashboardLayout>
                </MenuProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/menus/:menuId"
            element={
              <ProtectedRoute>
                <MenuProvider>
                  <DashboardLayout>
                    <MenuDetail />
                  </DashboardLayout>
                </MenuProvider>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
