import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import AddProduct from './pages/AddProduct.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Customers from './pages/Customers.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import Discounts from './pages/Discounts.jsx';
import Inventory from './pages/Inventory.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import { fetchHealth } from './services/adminApi.js';
import { useAuth } from './context/AuthContext.jsx';

function Placeholder({ title }) {
  return (
    <div className="admin-card main-panel">
      <div className="panel-header">
        <h3>{title}</h3>
      </div>
      <div className="empty-state">This {title.toLowerCase()} module is ready for implementation.</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="admin-app"><div className="loading-shell">Checking authentication...</div></div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  const [dbStatus, setDbStatus] = useState('checking');
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await fetchHealth();
        setDbStatus(health.status === 'ready' ? 'live' : 'offline');
      } catch (error) {
        setDbStatus('offline');
      } finally {
        setAppLoading(false);
      }
    }
    checkHealth();
  }, []);

  if (appLoading) {
    return <div className="admin-app"><div className="loading-shell">Loading admin...</div></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="*" element={
          <ProtectedRoute>
            <Layout dbStatus={dbStatus}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<AddProduct />} />
                
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerProfile />} />
                <Route path="/discounts" element={<Discounts />} />
                <Route path="/returns" element={<Placeholder title="Returns & Refunds" />} />
                <Route path="/shipping" element={<Placeholder title="Shipping" />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
