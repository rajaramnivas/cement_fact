import React, { useEffect } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext';
import { attachToken } from './api/client';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { isAuthenticated, user, logout, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    attachToken(token);
  }, [token]);

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="brand">Cement & Steel Shop</div>
        <div className="nav-links">
          <Link className="btn" to="/">
            Products
          </Link>
          {isAuthenticated && (
            <>
              <Link className="btn" to="/orders">
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link className="btn" to="/admin/products">
                  Admin
                </Link>
              )}
            </>
          )}
          {!isAuthenticated ? (
            <Link className="btn" to="/login">
              Login
            </Link>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProductsPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
