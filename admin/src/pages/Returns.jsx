import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';

const FILTERS = [
  { value: 'all', label: 'All requests' },
  { value: 'requested', label: 'Needs review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'received', label: 'Awaiting refund' },
  { value: 'refunded', label: 'Refund recorded' },
];

const REASONS = {
  damaged: 'Item arrived damaged',
  wrong_item: 'Wrong item received',
  quality_issue: 'Quality issue',
  changed_mind: 'Changed my mind',
  other: 'Other',
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatStatus = (status) => ({
  requested: 'Needs review',
  approved: 'Approved',
  rejected: 'Rejected',
  received: 'Awaiting refund',
  refunded: 'Refund recorded',
}[status] || status);

export default function Returns() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [refundReferences, setRefundReferences] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getReturnRequests(filter === 'all' ? '' : filter, page);
      if (!data || !Array.isArray(data.requests)) throw new Error('Unexpected returns response');
      setRequests(data.requests);
      setPages(data.pages);
      setTotal(data.total);
    } catch (requestError) {
      console.error('Failed to load return requests:', requestError);
      setError(requestError.message || 'Return requests could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const visibleRequests = requests;

  const updateRequest = async (request, status) => {
    setError('');
    setSavingId(request._id);
    try {
      const updated = await adminApi.updateReturnRequest(request._id, {
        status,
        admin_note: adminNotes[request._id] ?? request.admin_note ?? '',
        ...(status === 'refunded' ? { refund_reference: refundReferences[request._id] || '' } : {}),
      });
      setRequests((current) => current.map((item) => item._id === updated._id
        ? { ...item, ...updated, order: item.order }
        : item));
      setAdminNotes((current) => ({ ...current, [request._id]: updated.admin_note || '' }));
      setRefundReferences((current) => ({ ...current, [request._id]: '' }));
    } catch (requestError) {
      console.error('Failed to update return request:', requestError);
      setError(requestError.message || 'Return request could not be updated.');
    } finally {
      setSavingId('');
    }
  };

  const statusClass = (status) => {
    if (status === 'approved' || status === 'received' || status === 'refunded') return 'success';
    if (status === 'requested') return 'warning';
    if (status === 'rejected') return 'danger';
    return '';
  };

  return (
    <div className="admin-card main-panel">
      <div className="panel-header">
        <div>
          <h3 style={{ marginBottom: '6px' }}>Returns &amp; Refunds</h3>
          <small style={{ color: 'var(--muted-on-dark)' }}>Review requests for delivered orders and track each return to completion.</small>
        </div>
        <button type="button" className="ghost-button" onClick={loadRequests} disabled={loading}>
          Refresh
        </button>
      </div>

      <div role="note" className="empty-state" style={{ minHeight: 'auto', display: 'block', padding: '14px 16px', marginBottom: '20px', textAlign: 'left' }}>
        Refunds are not processed by a payment gateway here. Record a refund only after it has been issued through your payment provider or other payment channel.
      </div>

      <div className="segmented" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={filter === item.value ? 'active' : ''}
            onClick={() => { setFilter(item.value); setPage(1); }}
            style={filter === item.value ? { background: 'var(--white)', color: 'var(--ink)' } : {}}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="empty-state" role="alert" style={{ minHeight: 'auto', padding: '14px', marginBottom: '16px', color: '#ff9b9b' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-shell">Loading return requests...</div>
      ) : visibleRequests.length === 0 ? (
        <div className="empty-state">
          {requests.length === 0 ? 'No return requests have been submitted yet.' : 'No return requests match this filter.'}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => (
                <tr key={request._id}>
                  <td>
                    <button type="button" className="text-action" onClick={() => navigate(`/orders/${request.order_id}`)}>
                      {request.order?.order_number || request.order_number}
                    </button>
                    <small style={{ display: 'block', marginTop: '4px' }}>₹{request.order?.total ?? '—'}</small>
                  </td>
                  <td>
                    <strong style={{ display: 'block', color: 'var(--white)' }}>{request.customer_name}</strong>
                    <small>{request.customer_email}</small>
                  </td>
                  <td>
                    <span>{REASONS[request.reason] || request.reason}</span>
                    {request.details && <small style={{ display: 'block', whiteSpace: 'normal', maxWidth: '240px', marginTop: '4px' }}>{request.details}</small>}
                  </td>
                  <td>{formatDate(request.requested_at)}</td>
                  <td>
                    <span className={`status-pill ${statusClass(request.status)}`}>{formatStatus(request.status)}</span>
                    {request.refund_reference && <small style={{ display: 'block', marginTop: '5px' }}>Ref: {request.refund_reference}</small>}
                    {request.admin_note && <small style={{ display: 'block', whiteSpace: 'normal', maxWidth: '200px', marginTop: '5px' }}>Note: {request.admin_note}</small>}
                  </td>
                  <td>
                    <div style={{ display: 'grid', gap: '8px', minWidth: '180px' }}>
                      {request.status === 'requested' && (
                        <>
                          <textarea
                            className="form-control"
                            rows="2"
                            maxLength="1000"
                            aria-label={`Internal note for ${request.order_number}`}
                            placeholder="Internal note (optional)"
                            value={adminNotes[request._id] || ''}
                            onChange={(event) => setAdminNotes((current) => ({ ...current, [request._id]: event.target.value }))}
                          />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button type="button" className="primary-button" disabled={Boolean(savingId)} onClick={() => updateRequest(request, 'approved')}>Approve</button>
                            <button type="button" className="ghost-button" disabled={Boolean(savingId)} onClick={() => updateRequest(request, 'rejected')}>Reject</button>
                          </div>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button type="button" className="primary-button" disabled={Boolean(savingId)} onClick={() => updateRequest(request, 'received')}>Mark return received</button>
                      )}
                      {request.status === 'received' && (
                        <>
                          <input
                            className="form-control"
                            type="text"
                            maxLength="120"
                            aria-label={`External refund reference for ${request.order_number}`}
                            placeholder="External refund reference"
                            value={refundReferences[request._id] || ''}
                            onChange={(event) => setRefundReferences((current) => ({ ...current, [request._id]: event.target.value }))}
                          />
                          <button
                            type="button"
                            className="primary-button"
                            disabled={Boolean(savingId) || !refundReferences[request._id]?.trim()}
                            onClick={() => updateRequest(request, 'refunded')}
                          >
                            Record refund issued
                          </button>
                        </>
                      )}
                      {(request.status === 'rejected' || request.status === 'refunded') && <span style={{ color: 'var(--muted-on-dark)' }}>No further action</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <small style={{ color: 'var(--muted-on-dark)' }}>Page {page} of {pages} · {total} requests</small>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="ghost-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <button type="button" className="ghost-button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
