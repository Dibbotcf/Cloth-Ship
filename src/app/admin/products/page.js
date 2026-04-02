'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product successfully deleted!');
      } else {
        const errorData = await res.json();
        alert('Failed to delete product: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error deleting product. Please check your connection.');
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
          <p>Loading products...</p>
        ) : error ? (
          <div style={{ color: '#c62828', padding: '20px', background: '#ffebee', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '8px' }}>Database Error</h3>
            <p>{error}</p>
            <p style={{ marginTop: '10px', fontSize: '12px' }}>Please import the provided `clothship.sql` file into your MySQL database and ensure `.env` has the correct credentials.</p>
          </div>
        ) : products.length === 0 ? (
          <p>No products found in the database. Add one to get started.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <img src={product.image} alt={product.name} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td><strong>{product.name}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                  <td>৳{product.price.toLocaleString()}</td>
                  <td>
                    {product.is_featured === 1 && <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '4px' }}>Featured</span>}
                    {product.is_new === 1 && <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>New</span>}
                  </td>
                  <td className={styles.actions}>
                    <Link href={`/admin/products/edit/${product.id}`} className={styles.editBtn}>Edit</Link>
                    <button onClick={() => deleteProduct(product.id)} className={styles.deleteBtn}>Delete</button>
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
