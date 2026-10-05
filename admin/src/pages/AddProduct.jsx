import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    barcode: '',
    stock: 0,
    status: 'Draft',
    category: '',
  });

  const [media, setMedia] = useState([]);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', values: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaDrop = (e) => {
    e.preventDefault();
    // Dummy drop handler
    setMedia([...media, { id: Date.now(), name: 'uploaded-image.png' }]);
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.values) {
      setVariants([...variants, { ...newVariant, values: newVariant.values.split(',').map(v => v.trim()) }]);
      setNewVariant({ name: '', values: '' });
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map form data to backend schema
      const payload = {
        name: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        compareAtPrice: parseFloat(formData.compareAtPrice) || null,
        stock: parseInt(formData.stock, 10) || 0,
        category: formData.category || 'men',
        slug: formData.sku || undefined,
        tag: formData.status,
      };

      await adminApi.createProduct(payload);
      navigate('/products');
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(error.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      <div className="panel-header" style={{ marginBottom: '20px' }}>
        <h2>Add New Product</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="ghost-button" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="primary-button">Save Product</button>
        </div>
      </div>
      
      <div className="content-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* BASIC INFO */}
          <div className="admin-card">
            <h3>Basic Info</h3>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Essential Oversized Sweatshirt" />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="5" placeholder="Detailed product description..." />
            </div>
          </div>

          {/* MEDIA UPLOAD */}
          <div className="admin-card">
            <h3>Media</h3>
            <div 
              className="media-upload-area" 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={handleMediaDrop}
              style={{
                marginTop: '16px',
                border: '1px dashed var(--line-on-dark)',
                borderRadius: 'var(--radius-md)',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--muted-on-dark)',
                cursor: 'pointer'
              }}
              onClick={() => handleMediaDrop({ preventDefault: () => {} })}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
              <p>Drag and drop images here, or click to upload</p>
              <small>Accepts JPG, PNG, WEBP (Max 5MB)</small>
            </div>
            {media.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                {media.map((m) => (
                  <div key={m.id} style={{ width: '80px', height: '80px', background: 'var(--black-soft)', border: '1px solid var(--line-on-dark)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--muted-on-dark)' }}>
                    {m.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* PRICING */}
          <div className="admin-card">
            <h3>Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" required placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Compare at price</label>
                <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="form-control" placeholder="0.00" />
              </div>
            </div>
          </div>
          
          {/* INVENTORY */}
          <div className="admin-card">
            <h3>Inventory</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label>SKU (Stock Keeping Unit)</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="form-control" placeholder="e.g. NOVA-001" />
              </div>
              <div className="form-group">
                <label>Barcode (ISBN, UPC, GTIN, etc.)</label>
                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="form-control" placeholder="0" />
              </div>
            </div>
          </div>

          {/* VARIANTS */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Variants</h3>
            </div>
            <p style={{ color: 'var(--muted-on-dark)', fontSize: '13px', marginTop: '8px' }}>
              Add options like size or color.
            </p>
            
            <div style={{ marginTop: '16px', background: 'var(--black-soft)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-on-dark)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
                <div className="form-group">
                  <label>Option name</label>
                  <input type="text" value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} className="form-control" placeholder="e.g. Size" />
                </div>
                <div className="form-group">
                  <label>Option values (comma separated)</label>
                  <input type="text" value={newVariant.values} onChange={(e) => setNewVariant({ ...newVariant, values: e.target.value })} className="form-control" placeholder="e.g. S, M, L, XL" />
                </div>
                <button type="button" className="ghost-button" onClick={addVariant}>Add</button>
              </div>
            </div>

            {variants.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {variants.map((v, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--line-on-dark)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{v.name}</strong>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {v.values.map(val => (
                          <span key={val} className="status-pill">{val}</span>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="icon-button" onClick={() => removeVariant(index)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="admin-card">
            <h3>Status</h3>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="admin-card">
            <h3>Organization</h3>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Product Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                <option value="">Select a category...</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
                <option value="outerwear">Outerwear</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Collections</label>
              <input type="text" className="form-control" placeholder="Search collections..." />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Tags</label>
              <input type="text" className="form-control" placeholder="Vintage, Cotton, Summer" />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
