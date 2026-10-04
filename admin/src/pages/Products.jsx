import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const productData = await adminApi.getProducts();
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const productRows = useMemo(() => {
    if (!products) return [];
    return products.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.slug || item.id,
      price: `₹${item.price}`,
      stock: item.stock,
      status: item.stock > 0 ? 'Active' : 'Out of Stock',
    }));
  }, [products]);

  if (loading) {
    return <div className="loading-shell">Loading products...</div>;
  }

  return (
    <div className="admin-card main-panel">
      <div className="panel-header">
        <h3>Products</h3>
        <button type="button" className="primary-button" onClick={() => navigate('/products/new')}>
          Add product
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productRows.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.price}</td>
                <td>{item.stock}</td>
                <td><span className="status-pill">{item.status}</span></td>
                <td>
                  <button type="button" className="ghost-button" style={{ padding: '6px 10px', fontSize: '12px' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
