'use client';
import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Database not connected.');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating order');
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Orders</h1>
      </div>

      <div className={styles.card}>
        {loading ? (
          <p>Loading orders...</p>
        ) : error ? (
          <div style={{ color: '#c62828', padding: '20px', background: '#ffebee', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '8px' }}>Database Error</h3>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    {order.customer_name}<br/>
                    <span style={{ fontSize: '12px', color: '#666' }}>{order.phone}</span>
                  </td>
                  <td>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</td>
                  <td>৳{parseFloat(order.total_amount).toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      background: order.status === 'Delivered' ? '#e8f5e9' : order.status === 'Pending' ? '#fff3e0' : '#e3f2fd', 
                      color: order.status === 'Delivered' ? '#2e7d32' : order.status === 'Pending' ? '#ef6c00' : '#1565c0', 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' 
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
