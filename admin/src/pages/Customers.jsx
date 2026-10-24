import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminApi.getCustomers();
      if (!Array.isArray(data) || data.some(customer => !customer || typeof customer !== 'object')) {
        throw new Error('Unexpected customers response');
      }
      setCustomers(data);
    } catch (requestError) {
      console.error('Failed to fetch customers:', requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    const name = typeof customer?.name === 'string' ? customer.name : '';
    const email = typeof customer?.email === 'string' ? customer.email : '';
    return `${name} ${email}`.toLowerCase().includes(normalizedSearch);
  });

  if (loading) {
    return <div className="loading-shell">Loading customers...</div>;
  }

  if (error) {
    return (
      <div className="admin-card main-panel">
        <div className="empty-state" role="alert" style={{ flexDirection: 'column', gap: '16px' }}>
          <span>Customers could not be loaded. Check your connection and try again.</span>
          <button type="button" className="ghost-button" onClick={loadCustomers}>Try again</button>
        </div>
      </div>
    );
  }

  const exportToCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'City', 'State', 'Total Orders', 'Total Spent'];
    const rows = customers.map(c => [
      `"${c.name || ''}"`, `"${c.email || ''}"`, `"${c.phone || ''}"`, `"${c.city || ''}"`, `"${c.state || ''}"`, c.total_orders ?? 0, c.total_spent ?? 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nova_customers.csv';
    link.click();
  };

  return (
    <div className="admin-card main-panel">
      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <h3>Customers</h3>
        <button type="button" className="ghost-button" onClick={exportToCSV}>Export CSV</button>
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search customers by name or email..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => (
              <tr key={customer.email || customer._id || index}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      background: 'var(--white)', color: 'var(--ink)', 
                      display: 'grid', placeItems: 'center', fontWeight: '600', fontSize: '12px' 
                    }}>
                      {(typeof customer.name === 'string' ? customer.name : 'Customer')
                        .split(/\s+/)
                        .filter(Boolean)
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--white)', marginBottom: '2px' }}>{customer.name || 'Customer'}</strong>
                      <small style={{ color: 'var(--muted-on-dark)' }}>{customer.email || '—'}</small>
                    </div>
                  </div>
                </td>
                <td>{[customer.city, customer.state].filter(Boolean).join(', ') || '—'}</td>
                <td>{customer.total_orders ?? 0}</td>
                <td>₹{customer.total_spent ?? 0}</td>
                <td>
                  <button 
                    type="button" 
                    className="ghost-button" 
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => customer.email && navigate(`/customers/${encodeURIComponent(customer.email)}`)}
                    disabled={!customer.email}
                  >
                    Profile
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state" style={{ minHeight: 'auto', padding: '20px', border: 'none' }}>
                    {normalizedSearch ? 'No customers match your search.' : 'No customer records found.'}
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
