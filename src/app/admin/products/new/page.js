'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../admin.module.css';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    category: 'sarees',
    gender: 'women',
    fabric: '',
    occasion: '',
    description: '',
    image: '/images/products/placeholder.png',
    sizes: 'Free Size',
    colors: 'Default',
    is_new: false,
    is_featured: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Parse comma separated sizes and colors
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.split(',').map(c => c.trim())
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
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

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Add New Product</h1>
        <Link href="/admin/products" className={styles.backBtn} style={{ textDecoration: 'none', color: '#666' }}>← Back to List</Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Product Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Image Path</label>
              <input type="text" name="image" required value={formData.image} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Price (৳)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Original Price (৳) (Optional)</label>
              <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="sarees">Sarees</option>
                <option value="salwar-kameez">Salwar Kameez</option>
                <option value="kurtas-women">Kurtas (Women)</option>
                <option value="panjabis">Panjabis</option>
                <option value="fatua">Fatua</option>
                <option value="waistcoats">Waistcoats</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Fabric</label>
              <input type="text" name="fabric" value={formData.fabric} onChange={handleChange} placeholder="e.g. Silk, Cotton" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Occasion</label>
              <input type="text" name="occasion" value={formData.occasion} onChange={handleChange} placeholder="e.g. Wedding, Casual" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Sizes (comma separated)</label>
              <input type="text" name="sizes" required value={formData.sizes} onChange={handleChange} placeholder="S, M, L, XL" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Colors (comma separated)</label>
              <input type="text" name="colors" required value={formData.colors} onChange={handleChange} placeholder="Red, Blue" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} />
              <span>Mark as "New Arrival"</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} />
              <span>Mark as "Featured"</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className={styles.primaryBtn} style={{ marginTop: '20px', width: 'fit-content' }}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
