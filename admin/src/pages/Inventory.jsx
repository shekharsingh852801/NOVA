import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi.js';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [localStock, setLocalStock] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const productData = await adminApi.getProducts();
        setInventory(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(inventory.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleStockChange = (id, newStock) => {
    setLocalStock(prev => ({ ...prev, [id]: parseInt(newStock, 10) || 0 }));
  };

  const saveUpdates = async (id) => {
    if (localStock[id] === undefined) return;
    try {
      await adminApi.updateProduct(id, { stock: localStock[id] });
      setInventory(inventory.map(item => item.id === id ? { ...item, stock: localStock[id] } : item));
      alert('Stock updated successfully');
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    const newStock = prompt(`Enter new stock value for ${selectedIds.length} selected items:`);
    if (newStock !== null) {
      const stockVal = parseInt(newStock, 10) || 0;
      try {
        for (const id of selectedIds) {
          await adminApi.updateProduct(id, { stock: stockVal });
        }
        setInventory(inventory.map(item => selectedIds.includes(item.id) ? { ...item, stock: stockVal } : item));
        setSelectedIds([]);
        alert(`Updated stock to ${stockVal} for ${selectedIds.length} items.`);
      } catch (err) {
        alert('Failed to update some items');
      }
    }
  };

  if (loading) {
    return <div className="loading-shell">Loading inventory...</div>;
  }

  return (
    <div className="admin-card main-panel">
      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <h3>Inventory</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button type="button" className="ghost-button" onClick={handleBulkUpdate}>
              Update {selectedIds.length} items
            </button>
          )}
          <button type="button" className="primary-button">View Purchase Orders</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === inventory.length && inventory.length > 0} />
              </th>
              <th>Product</th>
              <th>SKU</th>
              <th>Available</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const currentStock = localStock[item.id] !== undefined ? localStock[item.id] : item.stock;
              const status = currentStock > 10 ? 'In Stock' : currentStock > 0 ? 'Low Stock' : 'Out of Stock';
              return (
                <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                  <td>
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                  </td>
                  <td>
                    <strong style={{ display: 'block', color: 'var(--white)', marginBottom: '2px' }}>{item.name}</strong>
                    <small style={{ color: 'var(--muted-on-dark)' }}>{item.category}</small>
                  </td>
                  <td>{item.slug || item.id}</td>
                  <td>
                    <input 
                      type="number" 
                      value={currentStock} 
                      onChange={(e) => handleStockChange(item.id, e.target.value)}
                      className="form-control" 
                      style={{ width: '80px', padding: '6px 10px', height: '32px' }} 
                    />
                  </td>
                  <td>
                    <span className={`status-pill ${status === 'In Stock' ? 'success' : status === 'Low Stock' ? 'warning' : 'danger'}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {localStock[item.id] !== undefined && localStock[item.id] !== item.stock && (
                      <button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => saveUpdates(item.id)}>Save</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
