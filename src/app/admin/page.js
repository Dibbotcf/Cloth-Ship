'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shirt, Package, Banknote, Zap, Plus, ClipboardList, Globe, FolderTree } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statItems = [
    {
      label: 'Total Products',
      value: loading ? '—' : stats.products,
      icon: <Shirt size={24} strokeWidth={1.5} />,
      iconClass: styles.statIconProducts,
      trend: 'Listed in catalog',
    },
    {
      label: 'Total Orders',
      value: loading ? '—' : stats.orders,
      icon: <Package size={24} strokeWidth={1.5} />,
      iconClass: styles.statIconOrders,
      trend: 'All time',
    },
    {
      label: 'Total Revenue',
      value: loading ? '—' : `৳${stats.revenue.toLocaleString()}`,
      icon: <Banknote size={24} strokeWidth={1.5} />,
      iconClass: styles.statIconRevenue,
      trend: 'Cumulative',
    },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageLabel}>Overview</span>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statItems.map(item => (
          <div key={item.label} className={styles.statCard}>
            <div className={styles.statCardInner}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{item.label}</span>
                <span className={styles.statValue}>{item.value}</span>
                <span className={styles.statTrend}>{item.trend}</span>
              </div>
              <div className={`${styles.statIcon} ${item.iconClass}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.activityCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} strokeWidth={2} /> Quick Actions
          </span>
        </div>
        <div className={styles.quickActions}>
          <Link href="/admin/products/new" className={styles.quickActionBtn}>
            <div className={styles.quickActionIcon}><Plus size={24} strokeWidth={1.5} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionTitle}>Add New Product</span>
              <span className={styles.quickActionDesc}>List a new item to the catalog</span>
            </div>
          </Link>
          <Link href="/admin/products" className={styles.quickActionBtn}>
            <div className={styles.quickActionIcon}><Shirt size={24} strokeWidth={1.5} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionTitle}>Manage Products</span>
              <span className={styles.quickActionDesc}>Edit, update or remove items</span>
            </div>
          </Link>
          <Link href="/admin/categories" className={styles.quickActionBtn}>
            <div className={styles.quickActionIcon}><FolderTree size={24} strokeWidth={1.5} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionTitle}>Manage Categories</span>
              <span className={styles.quickActionDesc}>Add, edit, or remove categories</span>
            </div>
          </Link>
          <Link href="/admin/orders" className={styles.quickActionBtn}>
            <div className={styles.quickActionIcon}><ClipboardList size={24} strokeWidth={1.5} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionTitle}>View Orders</span>
              <span className={styles.quickActionDesc}>Track & update order statuses</span>
            </div>
          </Link>
          <Link href="/" target="_blank" className={styles.quickActionBtn}>
            <div className={styles.quickActionIcon}><Globe size={24} strokeWidth={1.5} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionTitle}>View Storefront</span>
              <span className={styles.quickActionDesc}>Open the live store in a new tab</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
