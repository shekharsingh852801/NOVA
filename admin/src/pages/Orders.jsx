import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';

export default function Orders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const orderData = await adminApi.getOrders();
        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const mapStatus = (status) => {
    switch (status) {
      case 'confirmed': return 'Unfulfilled';
      case 'packed': return 'Processing';
      case 'shipped':
      case 'out_for_delivery': return 'Processing';
      case 'delivered': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unfulfilled';
    }
  };

  const filteredOrders = useMemo(() => {
    const formattedOrders = orders.map(o => ({
      id: o.order_number,
      dbId: o.id,
      customer: o.customer_name,
      amount: `₹${o.total}`,
      status: mapStatus(o.status),
      date: new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    if (filter === 'All') return formattedOrders;
    return formattedOrders.filter(o => o.status === filter);
  }, [filter, orders]);

  if (loading) {
    return <div className="loading-shell">Loading orders...</div>;
  }

  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order', 'Date', 'Customer', 'Total', 'Status'];
    // We filter using the same logic but format specifically for CSV
    const rows = orders
      .filter(o => filter === 'All' || mapStatus(o.status) === filter)
      .map(o => {
        const dateStr = new Date(o.created_at).toISOString().split('T')[0];
        return [`"${o.order_number}"`, `"${dateStr}"`, `"${o.customer_name}"`, o.total, `"${mapStatus(o.status)}"`];
      });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    // Prepend BOM (\uFEFF) for Excel to read UTF-8 properly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nova_orders.csv';
    link.click();
  };

  return (
    <div className="admin-card main-panel">
      <div className="panel-header" style={{ marginBottom: '16px' }}>
        <h3>Orders</h3>
        <button type="button" className="ghost-button" onClick={exportToCSV}>Export CSV</button>
      </div>

      <div className="segmented" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        {['All', 'Unfulfilled', 'Processing', 'Completed'].map(f => (
          <button 
            key={f} 
            type="button" 
            className={filter === f ? 'active' : ''} 
            onClick={() => setFilter(f)}
            style={filter === f ? { background: 'var(--white)', color: 'var(--ink)' } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 500, color: 'var(--white)' }}>{order.id}</td>
                <td>{order.date}</td>
                <td>{order.customer}</td>
                <td>{order.amount}</td>
                <td>
                  <span className={`status-pill ${order.status === 'Completed' ? 'success' : order.status === 'Processing' ? 'warning' : ''}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button 
                    type="button" 
                    className="ghost-button" 
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => navigate(`/orders/${order.dbId}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state" style={{ minHeight: 'auto', padding: '20px', border: 'none' }}>
                    No orders found for this filter.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
