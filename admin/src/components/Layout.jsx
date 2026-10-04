import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'dashboard', path: '/', label: 'Dashboard' },
  { id: 'orders', path: '/orders', label: 'Orders' },
  { id: 'products', path: '/products', label: 'Products' },
  { id: 'inventory', path: '/inventory', label: 'Inventory' },
  { id: 'customers', path: '/customers', label: 'Customers' },
  { id: 'discounts', path: '/discounts', label: 'Discounts' },
  { id: 'returns', path: '/returns', label: 'Returns & Refunds' },
  { id: 'shipping', path: '/shipping', label: 'Shipping' },
  { id: 'settings', path: '/settings', label: 'Store Settings' },
];

export default function Layout({ children, dbStatus }) {
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/products')) return 'Product Management';
    if (path.startsWith('/orders')) return 'Order Operations';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/settings')) return 'System Settings';
    if (path.startsWith('/inventory')) return 'Inventory Management';
    if (path.startsWith('/discounts')) return 'Marketing & Discounts';
    return 'Admin Control';
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="brand">NOVA</div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="search-box">
            <span>⌕</span>
            <input type="text" placeholder="Search products, orders, customers..." />
          </div>
          <div className="topbar-actions">
            <button type="button" className="icon-button">🔔</button>
            <div className="profile-box">
              <span className="profile-avatar">AD</span>
              <div>
                <strong>Admin</strong>
                <small>Super Admin</small>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content-inner">
          <div className="page-header">
            <div>
              <small className="eyebrow">NOVA Admin Panel</small>
              <h1>{getPageTitle(location.pathname)}</h1>
            </div>
            <div className={dbStatus === 'live' ? 'status-badge live' : 'status-badge offline'}>
              {dbStatus === 'live' ? 'Live DB' : 'Local mode'}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%', height: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
