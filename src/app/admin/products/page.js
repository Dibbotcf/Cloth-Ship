'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Database not connected. Please ensure MySQL is running and configured.');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (res.ok) {
        // Force re-fetch to get fresh list
        await fetchProducts();
        alert('✅ Product deleted successfully!');
      } else {
        alert('❌ Failed to delete: ' + (body.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Network error. Check DB connection.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products</h1>
        <Link href="/admin/products/new" className={styles.primaryBtn}>+ Add New Product</Link>
      </div>

      <div className={styles.card}>
        {loading ? (
          <p style={{ padding: '20px', color: '#666' }}>Loading products...</p>
        ) : error ? (
          <div style={{ color: '#c62828', padding: '20px', background: '#ffebee', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '8px' }}>⚠️ Database Error</h3>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <p style={{ padding: '20px', color: '#666' }}>No products found. <Link href="/admin/products/new" style={{ color: 'var(--color-primary)' }}>Add your first product →</Link></p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th style={{ width: '70px' }}>Image</th>
                <th>Name</th>
                <th style={{ width: '140px' }}>Category</th>
                <th style={{ width: '110px' }}>Price</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={{ color: '#999', fontSize: '12px' }}>{product.id}</td>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '44px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee', display: 'block' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '54px', background: '#f0f0f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>
                    )}
                  </td>
                  <td>
                    <strong style={{ fontSize: '14px' }}>{product.name}</strong>
                    {product.fabric && <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{product.fabric}</div>}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '13px', color: '#555' }}>
                    {product.category.replace(/-/g, ' ')}
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-primary)' }}>৳{parseFloat(product.price).toLocaleString()}</strong>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <div style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through' }}>৳{parseFloat(product.original_price).toLocaleString()}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {product.is_featured === 1 && (
                        <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '3px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>Featured</span>
                      )}
                      {product.is_new === 1 && (
                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '3px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>New</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Link href={`/admin/products/edit/${product.id}`} className={styles.editBtn}>Edit</Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className={styles.deleteBtn}
                      >
                        {deletingId === product.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
