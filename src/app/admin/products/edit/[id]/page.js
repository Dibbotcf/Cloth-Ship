'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../admin.module.css';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', price: '', original_price: '', category: 'sarees', gender: 'women',
    fabric: '', occasion: '', description: '', image: '', sizes: '', colors: '',
    is_new: false, is_featured: false
  });

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch product details");
        return res.json();
      })
      .then(data => {
        // Handle JSON parsed arrays back to comma-separated strings for the form
        const colorsStr = typeof data.colors === 'string' ? JSON.parse(data.colors).join(', ') : (data.colors || []).join(', ');
        const sizesStr = typeof data.sizes === 'string' ? JSON.parse(data.sizes).join(', ') : (data.sizes || []).join(', ');
        
        setFormData({
          name: data.name,
          price: data.price,
          original_price: data.original_price || '',
          category: data.category,
          gender: data.gender,
          fabric: data.fabric || '',
          occasion: data.occasion || '',
          description: data.description || '',
          image: data.image || '',
          sizes: sizesStr,
          colors: colorsStr,
          is_new: data.is_new === 1,
          is_featured: data.is_featured === 1
        });
        setImagePreview(data.image || null);
      })
      .catch(err => setError(err.message))
      .finally(() => setInitialFetch(false));
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload error.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        router.push('/admin/products');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      alert('Network error. Check DB connection.');
    } finally {
      setLoading(false);
    }
  };

  if (initialFetch) return <div style={{padding: '40px'}}>Loading...</div>;
  if (error) return <div style={{padding: '40px', color: 'red'}}>Error: {error}</div>;

  const inputStyle = { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' };
  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Edit: {formData.name}</h1>
        <Link href="/admin/products" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>← Back to Products</Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px', maxWidth: '860px' }}>

          {/* Image Upload */}
          <div style={{ border: '2px dashed #e0e0e0', borderRadius: '10px', padding: '24px', background: '#fafafa' }}>
            <label style={labelStyle}>Product Image</label>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div
                onClick={() => fileRef.current.click()}
                style={{ width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, background: '#fff', position: 'relative' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                    <div>Click to upload</div>
                  </div>
                )}
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>Uploading...</div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                <button type="button" onClick={() => fileRef.current.click()} className={styles.primaryBtn} style={{ width: 'fit-content' }}>
                  {uploading ? 'Uploading…' : '📁 Change Image'}
                </button>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Or paste a URL / path below</p>
                <input
                  type="text" name="image" value={formData.image}
                  onChange={(e) => { handleChange(e); setImagePreview(e.target.value); }}
                  placeholder="/images/products/my-product.jpg"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Name + Prices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ ...fieldStyle, gridColumn: '1 / 2' }}>
              <label style={labelStyle}>Product Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Price (৳) *</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Original Price (৳)</label>
              <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Category + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                <option value="sarees">Sarees</option>
                <option value="salwar-kameez">Salwar Kameez</option>
                <option value="kurtas-women">Kurtas (Women)</option>
                <option value="panjabis">Panjabis</option>
                <option value="fatua">Fatua</option>
                <option value="waistcoats">Waistcoats</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>

          {/* Fabric + Occasion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Fabric</label>
              <input type="text" name="fabric" value={formData.fabric} onChange={handleChange} placeholder="e.g. Silk, Cotton" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Occasion</label>
              <input type="text" name="occasion" value={formData.occasion} onChange={handleChange} placeholder="e.g. Wedding, Casual" style={inputStyle} />
            </div>
          </div>

          {/* Sizes + Colors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Sizes (comma separated) *</label>
              <input type="text" name="sizes" required value={formData.sizes} onChange={handleChange} placeholder="S, M, L, XL" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Colors (comma separated) *</label>
              <input type="text" name="colors" required value={formData.colors} onChange={handleChange} placeholder="Red, Blue" style={inputStyle} />
            </div>
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}></textarea>
          </div>

          {/* Flags */}
          <div style={{ display: 'flex', gap: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
              Mark as <strong>New Arrival</strong>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
              Mark as <strong>Featured</strong>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="submit" disabled={loading || uploading} className={styles.primaryBtn}>
              {loading ? 'Saving...' : '✅ Update Product'}
            </button>
            <Link href="/admin/products" style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', color: '#666' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
