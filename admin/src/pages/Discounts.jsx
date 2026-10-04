import { useState } from 'react';

const mockDiscounts = [
  { id: '1', code: 'SUMMER20', type: 'Percentage', value: '20%', usage: '124 / 500', status: 'Active' },
  { id: '2', code: 'WELCOME10', type: 'Fixed Amount', value: '₹500', usage: '84 / ∞', status: 'Active' },
  { id: '3', code: 'FREESHIP', type: 'Free Shipping', value: 'Shipping', usage: '1,024 / ∞', status: 'Active' },
  { id: '4', code: 'FLASH50', type: 'Percentage', value: '50%', usage: '50 / 50', status: 'Expired' },
];

export default function Discounts() {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minRequirement: 'none',
    limitUsage: false,
    usageLimit: '',
  });

  if (showCreate) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="panel-header" style={{ marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="button" className="ghost-button" onClick={() => setShowCreate(false)} style={{ padding: '8px 12px' }}>← Back</button>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px' }}>Create Discount</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="primary-button" onClick={() => { alert('Discount created!'); setShowCreate(false); }}>Save Discount</button>
          </div>
        </div>
        
        <div className="content-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-card">
              <h3>Discount Code</h3>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <input type="text" className="form-control" placeholder="e.g. FALLSALE20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                <small style={{ color: 'var(--muted-on-dark)' }}>Customers will enter this code at checkout.</small>
              </div>
            </div>

            <div className="admin-card">
              <h3>Type and Value</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                    <option value="shipping">Free shipping</option>
                  </select>
                </div>
                {formData.type !== 'shipping' && (
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input type="number" className="form-control" placeholder={formData.type === 'percentage' ? '%' : '₹'} value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card">
              <h3>Minimum Requirements</h3>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <select className="form-control" value={formData.minRequirement} onChange={e => setFormData({...formData, minRequirement: e.target.value})}>
                  <option value="none">None</option>
                  <option value="amount">Minimum purchase amount (₹)</option>
                  <option value="quantity">Minimum quantity of items</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-card">
              <h3>Usage Limits</h3>
              <div className="form-group" style={{ marginTop: '16px', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={formData.limitUsage} onChange={e => setFormData({...formData, limitUsage: e.target.checked})} />
                <span style={{ color: 'var(--white)' }}>Limit number of times this discount can be used in total</span>
              </div>
              {formData.limitUsage && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <input type="number" className="form-control" placeholder="e.g. 100" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
                </div>
              )}
            </div>

            <div className="admin-card">
              <h3>Active Dates</h3>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Start Date</label>
                <input type="date" className="form-control" />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>End Date</label>
                <input type="date" className="form-control" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card main-panel">
      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <h3>Discounts</h3>
        <button type="button" className="primary-button" onClick={() => setShowCreate(true)}>Create Discount</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockDiscounts.map((discount) => (
              <tr key={discount.id}>
                <td style={{ fontWeight: 600, color: 'var(--white)' }}>{discount.code}</td>
                <td>{discount.type}</td>
                <td>{discount.value}</td>
                <td>{discount.usage}</td>
                <td>
                  <span className={`status-pill ${discount.status === 'Active' ? 'success' : ''}`}>
                    {discount.status}
                  </span>
                </td>
                <td>
                  <button type="button" className="ghost-button" style={{ padding: '6px 10px', fontSize: '12px' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
