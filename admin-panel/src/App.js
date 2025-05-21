import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import { FoodProvider } from './contexts/FoodContext';
import FoodList from './pages/foods/FoodList';
import FoodDetail from './pages/foods/FoodDetail';

// Layout component for protected routes
const DashboardLayout = () => (
  <div className="d-flex">
    <Sidebar />
    <div className="flex-grow-1">
      <Navbar />
      <main className="bg-light min-vh-100">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <FoodProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="menus" element={<MenuList />} />
                <Route path="menus/:menuId" element={<MenuDetail />} />
                <Route path="foods" element={<FoodList />} />
                <Route path="foods/:foodId" element={<FoodDetail />} />
                {/* Add more routes here */}
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </FoodProvider>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;
