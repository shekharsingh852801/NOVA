import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading-shell">Loading customers...</div>;
  }

  const exportToCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'City', 'State', 'Total Orders', 'Total Spent'];
    const rows = customers.map(c => [
      `"${c.name}"`, `"${c.email}"`, `"${c.phone}"`, `"${c.city}"`, `"${c.state}"`, c.total_orders, c.total_spent
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
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
              <tr key={customer.email}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      background: 'var(--white)', color: 'var(--ink)', 
                      display: 'grid', placeItems: 'center', fontWeight: '600', fontSize: '12px' 
                    }}>
                      {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--white)', marginBottom: '2px' }}>{customer.name}</strong>
                      <small style={{ color: 'var(--muted-on-dark)' }}>{customer.email}</small>
                    </div>
                  </div>
                </td>
                <td>{customer.city}, {customer.state}</td>
                <td>{customer.total_orders}</td>
                <td>₹{customer.total_spent}</td>
                <td>
                  <button 
                    type="button" 
                    className="ghost-button" 
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => navigate(`/customers/${encodeURIComponent(customer.email)}`)}
                  >
                    Profile
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state" style={{ minHeight: 'auto', padding: '20px', border: 'none' }}>
                    No customers match your search.
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
