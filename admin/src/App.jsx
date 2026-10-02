import { useEffect, useMemo, useState } from 'react';
import { fetchHealth, fetchProducts } from './services/adminApi.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'customers', label: 'Customers' },
  { id: 'discounts', label: 'Discounts' },
  { id: 'returns', label: 'Returns & Refunds' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'settings', label: 'Store Settings' },
];

const dashboardMetrics = [
  { label: 'Total Revenue', value: '₹2,48,750', change: '+12.5%' },
  { label: "Today's Revenue", value: '₹68,420', change: '+8.3%' },
  { label: 'Total Orders', value: '248', change: '+15.2%' },
  { label: "Today's Orders", value: '42', change: '+20.0%' },
  { label: 'Total Customers', value: '1,342', change: '+11.7%' },
];

const defaultProducts = [
  { id: 'p1', name: 'Essential Oversized Sweatshirt', sku: 'NOVA-0001', price: '₹79', stock: 18, status: 'Active' },
  { id: 'p2', name: 'Studio Cropped Hoodie', sku: 'NOVA-0002', price: '₹65', stock: 12, status: 'Active' },
  { id: 'p3', name: 'Utility Cargo Trouser', sku: 'NOVA-0003', price: '₹89', stock: 9, status: 'Active' },
  { id: 'p4', name: 'Field Canvas Jacket', sku: 'NOVA-0004', price: '₹148', stock: 6, status: 'Draft' },
];

function StatCard({ label, value, change }) {
  return (
    <div className="admin-card metric-card">
      <div className="metric-card__header">
        <span>{label}</span>
        <span className="trend up">{change}</span>
      </div>
      <div className="metric-card__value">{value}</div>
    </div>
  );
}

function TableCard({ title, columns, rows, emptyText }) {
  return (
    <div className="admin-card table-card">
      <div className="panel-header">
        <h3>{title}</h3>
        <button type="button" className="ghost-button">View all</button>
      </div>
      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id || row.name || row.order || row.sku}>
                  {columns.map((column) => (
                    <td key={`${row.id || row.name || row.order || row.sku}-${column}`}>
                      {row[column.toLowerCase().replace(/\s+/g, '_')] ?? row[column] ?? '-' }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">{emptyText}</div>
      )}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [dbStatus, setDbStatus] = useState('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [health, productData] = await Promise.all([
          fetchHealth(),
          fetchProducts(),
        ]);
        setDbStatus(health.status === 'ready' ? 'live' : 'offline');
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        setDbStatus('offline');
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const productRows = useMemo(() => {
    if (products.length) {
      return products.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.slug || item.id,
        price: `₹${item.price}`,
        stock: item.stock,
        status: item.stock > 0 ? 'Active' : 'Draft',
      }));
    }
    return defaultProducts.map((item) => ({
      ...item,
      sku: item.sku,
    }));
  }, [products]);

  const currentView = useMemo(() => {
    switch (active) {
      case 'dashboard':
        return (
          <>
            <div className="stats-grid">
              {dashboardMetrics.map((metric) => (
                <StatCard key={metric.label} label={metric.label} value={metric.value} change={metric.change} />
              ))}
            </div>
            <div className="content-grid">
              <div className="admin-card large-panel">
                <div className="panel-header">
                  <h3>Sales Overview</h3>
                  <div className="segmented">
                    <button type="button" className="active">7 Days</button>
                    <button type="button">30 Days</button>
                  </div>
                </div>
                <div className="chart-box">
                  <div className="chart-line" aria-label="Sales overview chart" />
                </div>
              </div>
              <div className="admin-card large-panel">
                <div className="panel-header">
                  <h3>Order Status</h3>
                </div>
                <div className="donut-wrap">
                  <div className="donut-chart" />
                  <div className="donut-center">
                    <strong>248</strong>
                    <span>Total Orders</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-grid three-col">
              <TableCard
                title="Top Selling Products"
                columns={['Product', 'Sold', 'Revenue']}
                rows={[
                  { id: 1, product: 'Essential Oversized Sweatshirt', sold: 1248, revenue: '₹24,000' },
                  { id: 2, product: 'Studio Cropped Hoodie', sold: 982, revenue: '₹16,700' },
                  { id: 3, product: 'Utility Cargo Trouser', sold: 764, revenue: '₹15,200' },
                ]}
                emptyText="No products data available"
              />
              <TableCard
                title="Low Stock Products"
                columns={['Product', 'Stock', 'Status']}
                rows={[
                  { id: 1, product: 'Cargo Pants', stock: 4, status: 'Low Stock' },
                  { id: 2, product: 'Denim Jacket', stock: 2, status: 'Low Stock' },
                ]}
                emptyText="No low stock items"
              />
              <div className="admin-card compact-panel">
                <div className="panel-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="actions-grid">
                  <button type="button">Add Product</button>
                  <button type="button">Manage Orders</button>
                  <button type="button">View Customers</button>
                  <button type="button">Create Discount</button>
                </div>
              </div>
            </div>
          </>
        );
      case 'products':
        return (
          <div className="admin-card main-panel">
            <div className="panel-header">
              <h3>Products</h3>
              <button type="button" className="primary-button">Add product</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productRows.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.sku}</td>
                      <td>{item.price}</td>
                      <td>{item.stock}</td>
                      <td><span className="status-pill">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="admin-card main-panel">
            <div className="panel-header">
              <h3>Orders</h3>
              <button type="button" className="primary-button">Export</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>#NOVA-2487</td><td>Rohan Mehta</td><td>₹4,299</td><td><span className="status-pill">Shipped</span></td></tr>
                  <tr><td>#NOVA-2486</td><td>Priya Sharma</td><td>₹2,199</td><td><span className="status-pill">Processing</span></td></tr>
                  <tr><td>#NOVA-2485</td><td>Aarav Singh</td><td>₹6,499</td><td><span className="status-pill">Confirmed</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="admin-card main-panel">
            <div className="panel-header">
              <h3>Inventory</h3>
              <button type="button" className="primary-button">Bulk update</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Essential Hoodie</td><td>Stone / M</td><td>12</td><td><span className="status-pill">Available</span></td></tr>
                  <tr><td>Cargo Pants</td><td>Field / 32</td><td>5</td><td><span className="status-pill warning">Low Stock</span></td></tr>
                  <tr><td>Basic Tee</td><td>Black / M</td><td>0</td><td><span className="status-pill danger">Out of Stock</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'customers':
        return (
          <div className="admin-card main-panel">
            <div className="panel-header">
              <h3>Customers</h3>
              <button type="button" className="primary-button">Export</button>
            </div>
            <div className="customer-grid">
              {['Rohan Mehta', 'Priya Sharma', 'Aarav Singh', 'Sneha Patel'].map((customer) => (
                <div className="mini-card" key={customer}>
                  <div className="mini-card__avatar">{customer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                  <strong>{customer}</strong>
                  <span>8 orders</span>
                  <small>₹14,620 total spend</small>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="admin-card main-panel">
            <div className="panel-header">
              <h3>{navItems.find((item) => item.id === active)?.label || 'Page'}</h3>
            </div>
            <div className="empty-state">This admin module is ready for implementation.</div>
          </div>
        );
    }
  }, [active, productRows, products]);

  if (loading) {
    return <div className="admin-app"><div className="loading-shell">Loading admin...</div></div>;
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="brand">NOVA</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={active === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
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

        <div className="page-header">
          <div>
            <small className="eyebrow">Overview</small>
            <h1>Good morning, Admin</h1>
          </div>
          <div className={dbStatus === 'live' ? 'status-badge live' : 'status-badge offline'}>
            {dbStatus === 'live' ? 'Live DB' : 'Local mode'}
          </div>
        </div>

        {currentView}
      </main>
    </div>
  );
}
