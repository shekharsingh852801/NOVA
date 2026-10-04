import { useState, useEffect } from 'react';
import { StatCard, TableCard } from '../components/Cards.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { adminApi } from '../services/adminApi.js';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#7be5a9', '#f7d77a', '#ff9b9b', '#9b9bff', '#ff9bee'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ products: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const overview = await adminApi.getOverview();
        setData(overview);
      } catch (err) {
        console.error("Failed to load overview:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="loading-shell">Loading dashboard...</div>;
  }

  const { products, orders } = data;

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  const dashboardMetrics = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+0.0%' },
    { label: 'Total Orders', value: totalOrders.toString(), change: '+0.0%' },
    { label: 'Total Products', value: products.length.toString(), change: '+0.0%' },
  ];

  // Order Status Pie Chart
  const statusCounts = orders.reduce((acc, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const orderData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Low Stock
  const lowStockProducts = products.filter(p => p.stock < 10).map((p, idx) => ({
    id: p.id,
    product: p.name,
    stock: p.stock,
    status: p.stock > 0 ? 'Low Stock' : 'Out of Stock'
  })).slice(0, 5);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="stats-grid">
        {dashboardMetrics.map((metric) => (
          <motion.div key={metric.label} variants={itemVariants}>
            <StatCard label={metric.label} value={metric.value} change={metric.change} />
          </motion.div>
        ))}
      </div>
      <div className="content-grid">
        <motion.div variants={itemVariants} className="admin-card large-panel">
          <div className="panel-header">
            <h3>Sales Overview</h3>
            <div className="segmented">
              <button type="button" className="active">7 Days</button>
            </div>
          </div>
          <div style={{ height: '240px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-on-dark)' }}>
            Sales chart data gathering in progress...
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="admin-card large-panel">
          <div className="panel-header">
            <h3>Order Status</h3>
          </div>
          <div style={{ height: '240px', marginTop: '16px', position: 'relative' }}>
            {orderData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {orderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--black-soft)', borderColor: 'var(--line-on-dark)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--white)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '24px', color: 'var(--white)' }}>{totalOrders}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted-on-dark)' }}>Total Orders</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-on-dark)' }}>
                No orders yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <div className="content-grid three-col">
        <motion.div variants={itemVariants}>
          <TableCard
            title="Low Stock Products"
            columns={['Product', 'Stock', 'Status']}
            rows={lowStockProducts}
            emptyText="No low stock items"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="admin-card compact-panel">
          <div className="panel-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <button type="button" onClick={() => navigate('/products/new')}>Add Product</button>
            <button type="button" onClick={() => navigate('/orders')}>Manage Orders</button>
            <button type="button" onClick={() => navigate('/customers')}>View Customers</button>
            <button type="button" onClick={() => navigate('/settings')}>Settings</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
