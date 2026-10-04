import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi.js';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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

  const handleFulfill = async () => {
    try {
      // For simplicity, directly marking as shipped
      const updated = await adminApi.updateOrderStatus(id, { status: 'shipped' });
      setOrder(updated);
      alert(`Order marked as shipped. Tracking: ${trackingNumber || 'Not provided'}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading-shell">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="admin-card">
        <div className="empty-state">Order not found.</div>
      </div>
    );
  }

  const displayStatus = mapStatus(order.status);
  const dateFormatted = new Date(order.created_at).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'
  });

  return (
    <>
      <div className="hide-on-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="panel-header" style={{ marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="button" className="ghost-button" onClick={() => navigate('/orders')} style={{ padding: '8px 12px' }}>← Back</button>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px' }}>Order {order.order_number}</h2>
            <span className={`status-pill ${displayStatus === 'Completed' ? 'success' : displayStatus === 'Processing' ? 'warning' : ''}`}>{displayStatus}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="ghost-button" onClick={printInvoice}>Print Invoice</button>
            <button type="button" className="ghost-button">Refund</button>
          </div>
        </div>
        <p style={{ color: 'var(--muted-on-dark)', marginTop: '-12px' }}>{dateFormatted}</p>

        <div className="content-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-card">
              <h3>Items</h3>
              <div className="table-wrap" style={{ marginTop: '16px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <strong style={{ display: 'block', color: 'var(--white)' }}>{item.name}</strong>
                          <small style={{ color: 'var(--muted-on-dark)' }}>{item.color} / {item.size}</small>
                        </td>
                        <td>₹{item.unitPrice}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-on-dark)' }}>
                    <span>Subtotal</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-on-dark)' }}>
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--white)', fontWeight: '600', fontSize: '16px', paddingTop: '12px', borderTop: '1px solid var(--line-on-dark)' }}>
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3>Fulfillment</h3>
              {displayStatus === 'Unfulfilled' ? (
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--black-soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-on-dark)' }}>
                  <div className="form-group">
                    <label>Tracking Number (Optional)</label>
                    <input type="text" className="form-control" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. BLUEDART123456" />
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="primary-button" onClick={handleFulfill}>Mark as Shipped</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '16px', color: 'var(--muted-on-dark)' }}>
                  Items have been processed or shipped. Order Status: {displayStatus}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-card">
              <h3>Customer</h3>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--muted-on-dark)' }}>
                <div style={{ color: 'var(--white)', fontWeight: '500' }}>{order.customer_name}</div>
                <div>{order.customer_email}</div>
                <div>{order.customer_phone}</div>
              </div>
            </div>

            <div className="admin-card">
              <h3>Shipping Address</h3>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--muted-on-dark)', lineHeight: '1.6' }}>
                <div>{order.shipping_address}</div>
                <div>{order.shipping_city}, {order.shipping_state} {order.shipping_postal}</div>
                <div>Payment: {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Pay on Delivery'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print-only" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>NOVA</h1>
            <p style={{ margin: 0, color: '#555', fontSize: '12px' }}>support@nova.com</p>
            <p style={{ margin: 0, color: '#555', fontSize: '12px' }}>www.nova.com</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '500', color: '#000' }}>INVOICE</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#555' }}><strong>Order No:</strong> {order.order_number}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#555' }}><strong>Date:</strong> {dateFormatted}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#555' }}><strong>Payment:</strong> {order.payment_method === 'cash_on_delivery' ? 'COD' : 'Paid'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#777', margin: '0 0 12px 0', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Bill To / Ship To</h3>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{order.customer_name}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>{order.shipping_address}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>{order.shipping_city}, {order.shipping_state} {order.shipping_postal}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>{order.customer_phone}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>{order.customer_email}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #000', fontSize: '12px', textTransform: 'uppercase', color: '#555' }}>Item Description</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #000', fontSize: '12px', textTransform: 'uppercase', color: '#555' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #000', fontSize: '12px', textTransform: 'uppercase', color: '#555' }}>Qty</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #000', fontSize: '12px', textTransform: 'uppercase', color: '#555' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee' }}>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>{item.name}</strong>
                  <small style={{ color: '#666', fontSize: '12px' }}>{item.color} | Size: {item.size}</small>
                </td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: '14px' }}>₹{item.unitPrice}</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>₹{item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '14px', color: '#555' }}>
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '14px', color: '#555' }}>
              <span>Shipping:</span>
              <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #000', marginTop: '8px' }}>
              <span>Total Amount:</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '64px', textAlign: 'center', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '24px' }}>
          <p>Thank you for shopping with NOVA!</p>
          <p>If you have any questions concerning this invoice, contact support@nova.com.</p>
        </div>
      </div>
    </>
  );
}
