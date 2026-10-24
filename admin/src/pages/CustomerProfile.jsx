import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi.js';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // We don't have a notes backend table, keeping this local for UI purposes
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState(['Prefers evening deliveries.', 'VIP Buyer - always upgrade to fast shipping.']);

  const loadCustomer = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const data = await adminApi.getCustomer(id);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Unexpected customer response');
      }
      setCustomer(data);
    } catch (requestError) {
      console.error('Failed to fetch customer profile:', requestError);
      setCustomer(null);
      if (requestError.message === 'Customer not found') {
        setNotFound(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const handleAddNote = () => {
    if (note.trim()) {
      setSavedNotes([...savedNotes, note]);
      setNote('');
    }
  };

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

  if (loading) {
    return <div className="loading-shell">Loading customer profile...</div>;
  }

  if (error) {
    return (
      <div className="admin-card">
        <div className="empty-state" role="alert" style={{ flexDirection: 'column', gap: '16px' }}>
          <span>Customer profile could not be loaded. Check your connection and try again.</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="ghost-button" onClick={() => navigate('/customers')}>Back to customers</button>
            <button type="button" className="primary-button" onClick={loadCustomer}>Try again</button>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="admin-card">
        <div className="empty-state" role="status" style={{ flexDirection: 'column', gap: '16px' }}>
          <span>Customer not found.</span>
          <button type="button" className="ghost-button" onClick={() => navigate('/customers')}>Back to customers</button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="admin-card">
        <div className="empty-state">Customer not found.</div>
      </div>
    );
  }

  const customerName = typeof customer.name === 'string' && customer.name.trim() ? customer.name : 'Customer';
  const orders = Array.isArray(customer.orders)
    ? customer.orders.filter(order => order && typeof order === 'object')
    : [];
  const earliestOrder = orders.length > 0
    ? [...orders].sort((a, b) => new Date(a.date) - new Date(b.date))[0].date
    : null;
  const joinedDate = earliestOrder && !Number.isNaN(new Date(earliestOrder).getTime())
    ? new Date(earliestOrder).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const initials = customerName
    .split(/\s+/)
    .filter(Boolean)
    .map(namePart => namePart[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="panel-header" style={{ marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="button" className="ghost-button" onClick={() => navigate('/customers')} style={{ padding: '8px 12px' }}>← Back</button>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px' }}>{customerName}</h2>
          <span className="status-pill success">Active</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="ghost-button">Edit Profile</button>
        </div>
      </div>
      
      <div className="content-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-card">
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'var(--white)', color: 'var(--ink)', 
                display: 'grid', placeItems: 'center', fontWeight: '600', fontSize: '24px' 
              }}>
                {initials}
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Customer Stats</h3>
                <div style={{ display: 'flex', gap: '24px', color: 'var(--muted-on-dark)' }}>
                  <div>
                    <strong style={{ color: 'var(--white)', display: 'block', fontSize: '18px' }}>₹{customer.total_spent ?? 0}</strong>
                    <small>Lifetime Spent</small>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--white)', display: 'block', fontSize: '18px' }}>{customer.total_orders ?? orders.length}</strong>
                    <small>Total Orders</small>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--white)', display: 'block', fontSize: '18px' }}>{joinedDate}</strong>
                    <small>Customer Since</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="panel-header">
              <h3>All Orders</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map(order => {
                    const statusText = mapStatus(order.status);
                    const orderDate = new Date(order.date);
                    const formattedDate = Number.isNaN(orderDate.getTime())
                      ? '—'
                      : orderDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
                    return (
                      <tr key={order.dbId || order.id}>
                        <td style={{ color: 'var(--white)' }}>{order.id || '—'}</td>
                        <td>{formattedDate}</td>
                        <td>₹{order.total ?? 0}</td>
                        <td><span className={`status-pill ${statusText === 'Completed' ? 'success' : statusText === 'Processing' ? 'warning' : ''}`}>{statusText}</span></td>
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
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="empty-state" style={{ minHeight: 'auto', padding: '20px', border: 'none' }}>
                          No orders found for this customer.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-card">
            <h3>Contact Info</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--muted-on-dark)' }}>
              <div>✉️ {customer.email || '—'}</div>
              <div>📞 {customer.phone || '—'}</div>
              <div>📍 {[customer.city, customer.state, customer.postal].filter(Boolean).join(', ') || '—'}</div>
              <div>🏠 {customer.address || '—'}</div>
            </div>
          </div>

          <div className="admin-card">
            <h3>Tags</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
              <span className="status-pill warning">VIP</span>
            </div>
          </div>

          <div className="admin-card">
            <h3>Internal Notes</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedNotes.map((n, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--black-soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-on-dark)', color: 'var(--muted-on-dark)', fontSize: '13px' }}>
                  {n}
                </div>
              ))}
              <div className="form-group" style={{ marginTop: '8px' }}>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Leave a note about this customer..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <button type="button" className="primary-button" onClick={handleAddNote} style={{ justifyContent: 'center' }}>Save Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
