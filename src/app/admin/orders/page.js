'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_BADGE_CLASS = {
  Pending:    styles.badgePending,
  Processing: styles.badgeProcessing,
  Shipped:    styles.badgeShipped,
  Delivered:  styles.badgeDelivered,
  Cancelled:  styles.badgeCancelled,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Unable to connect to database.');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        showToast(`Order status updated to "${status}".`);
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch {
      showToast('Network error updating order.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (id, orderNumber) => {
    if (!window.confirm(`Delete order ${orderNumber}? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchOrders();
        showToast('Order deleted successfully.');
      } else {
        showToast('Failed to delete order.', 'error');
      }
    } catch {
      showToast('Network error deleting order.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '10px', maxWidth: '360px',
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '13.5px', fontWeight: '600',
          animation: 'fadeInDown 0.3s ease',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageLabel}>Sales</span>
          <h1 className={styles.pageTitle}>Orders</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: 13, color: '#9a9a9a', fontWeight: 600 }}>
            {!loading && !error && `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
          </span>
          <Link href="/admin/orders/new" className={styles.primaryBtn}>
            + Add Order
          </Link>
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th><th>Date</th><th>Customer</th>
                  <th>Payment</th><th>Total</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className={styles.loadingRows}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j}>
                        <div className={styles.skeleton} style={{ height: 13, borderRadius: 6, width: '75%' }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <div>
              <div className={styles.errorTitle}>Database Connection Error</div>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>No orders yet</div>
            <div className={styles.emptySubtitle}>Orders placed in your store will appear here.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5 }}>
                        {order.order_number}
                      </strong>
                    </td>
                    <td style={{ color: '#7a7a7a', fontSize: 13 }}>
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <strong style={{ fontSize: 13.5, display: 'block', color: '#1a1209' }}>
                        {order.customer_name}
                      </strong>
                      <span style={{ fontSize: 11.5, color: '#9a9a9a' }}>{order.phone}</span>
                    </td>
                    <td style={{ fontSize: 13, color: '#5a5a5a' }}>
                      {order.payment_method === 'cod' ? '💵 Cash on Delivery' : order.payment_method}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 14 }}>
                        ৳{parseFloat(order.total_amount).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${STATUS_BADGE_CLASS[order.status] || styles.badgePending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={styles.statusSelect}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <div className={styles.actions} style={{ justifyContent: 'flex-start' }}>
                          <Link href={`/admin/orders/${order.id}/edit`} className={styles.editBtn}>
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => deleteOrder(order.id, order.order_number)}
                            disabled={deletingId === order.id}
                            className={styles.deleteBtn}
                          >
                            {deletingId === order.id ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
