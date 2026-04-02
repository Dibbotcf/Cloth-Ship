'use client';
import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats({
            products: data.products,
            orders: data.orders,
            revenue: Number(data.revenue)
          });
        }
      })
      .catch(err => console.error("Failed to load global stats"));
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className={styles.card}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Products</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.products}</p>
        </div>
        <div className={styles.card}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Orders</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.orders}</p>
        </div>
        <div className={styles.card}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Revenue</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>৳{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Recent Activity</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Dashboard loaded successfully. Configure database connection to view real-time stats.</p>
      </div>
    </div>
  );
}
