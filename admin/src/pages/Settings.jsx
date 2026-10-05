import { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General details' },
    { id: 'shipping', label: 'Shipping and delivery' },
    { id: 'taxes', label: 'Taxes and duties' },
    { id: 'staff', label: 'Users and permissions' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <div className="admin-card">
              <h3>Store details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label>Store name</label>
                  <input type="text" className="form-control" defaultValue="NOVA" />
                </div>
                <div className="form-group">
                  <label>Store contact email</label>
                  <input type="email" className="form-control" defaultValue="support@nova.com" />
                </div>
                <div className="form-group">
                  <label>Store industry</label>
                  <select className="form-control" defaultValue="apparel">
                    <option value="apparel">Apparel & Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="beauty">Beauty & Cosmetics</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Store currency</h3>
              <p style={{ color: 'var(--muted-on-dark)', fontSize: '13px', margin: '4px 0 16px 0' }}>
                This is the currency your products are sold in.
              </p>
              <div className="form-group">
                <select className="form-control" style={{ maxWidth: '300px' }} defaultValue="INR">
                  <option value="INR">Indian Rupee (INR ₹)</option>
                  <option value="USD">US Dollar (USD $)</option>
                  <option value="EUR">Euro (EUR €)</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'shipping':
        return (
          <div className="admin-card">
            <div className="panel-header">
              <h3>Shipping rates</h3>
              <button type="button" className="ghost-button" style={{ padding: '6px 12px' }}>Add rate</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Zone name</th>
                    <th>Condition</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--white)', fontWeight: 500 }}>Domestic (India)</td>
                    <td>0 kg – 5 kg</td>
                    <td>₹150.00</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--white)', fontWeight: 500 }}>International</td>
                    <td>0 kg – 2 kg</td>
                    <td>₹1200.00</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--white)', fontWeight: 500 }}>Free Shipping</td>
                    <td>Orders over ₹5,000</td>
                    <td>₹0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'taxes':
        return (
          <div className="admin-card">
            <h3>Tax settings</h3>
            <div className="form-group" style={{ marginTop: '16px', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ color: 'var(--white)' }}>All prices include tax</span>
            </div>
            <div className="form-group" style={{ marginTop: '12px', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ color: 'var(--white)' }}>Charge tax on shipping rates</span>
            </div>

            <h4 style={{ marginTop: '32px', marginBottom: '16px' }}>Regional Tax Rates</h4>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Tax Name</th>
                    <th>Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--white)', fontWeight: 500 }}>India</td>
                    <td>GST</td>
                    <td>
                      <input type="number" className="form-control" defaultValue="18" style={{ width: '80px', padding: '4px 8px', height: '30px' }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'staff':
        return (
          <>
            <div className="admin-card">
              <div className="panel-header">
                <h3>Users and permissions</h3>
                <button type="button" className="primary-button" style={{ padding: '6px 12px' }}>Invite staff</button>
              </div>
              <p style={{ color: 'var(--muted-on-dark)', fontSize: '13px', margin: '-12px 0 16px 0' }}>
                Manage what users can see or do in your store.
              </p>
              
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>Admin (You)</td>
                      <td>admin@nova.com</td>
                      <td>Owner</td>
                      <td><span className="status-pill success">Active</span></td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>Jane Doe</td>
                      <td>jane@nova.com</td>
                      <td>
                        <select className="form-control" defaultValue="manager" style={{ padding: '4px 8px', height: '30px' }}>
                          <option value="manager">Manager (All Access)</option>
                          <option value="orders">Fulfillment (Orders Only)</option>
                          <option value="editor">Content (Products Only)</option>
                        </select>
                      </td>
                      <td><span className="status-pill warning">Pending Invite</span></td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>Raj Patel</td>
                      <td>raj@nova.com</td>
                      <td>
                        <select className="form-control" defaultValue="orders" style={{ padding: '4px 8px', height: '30px' }}>
                          <option value="manager">Manager (All Access)</option>
                          <option value="orders">Fulfillment (Orders Only)</option>
                          <option value="editor">Content (Products Only)</option>
                        </select>
                      </td>
                      <td><span className="status-pill success">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="main-panel">
      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <h3>Settings</h3>
        <button type="button" className="primary-button">Save Changes</button>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar Nav for Settings */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                textAlign: 'left',
                padding: '10px 16px',
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: activeTab === tab.id ? 'var(--white)' : 'var(--muted-on-dark)',
                fontWeight: activeTab === tab.id ? '500' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
