'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Plus, Trash2 } from 'lucide-react';
import styles from '../../admin.module.css';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_METHODS = ['cod', 'bkash', 'card'];

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '', email: '', phone: '',
    address: '', city: '', zip: '',
    payment_method: 'cod', status: 'Pending',
    shipping_amount: 150
  });

  const [items, setItems] = useState([
    { product_name: '', size: 'Free Size', quantity: 1, price: 0 }
  ]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_name: '', size: 'Free Size', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculatedTotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * parseInt(item.quantity || 1), 0) + parseFloat(formData.shipping_amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      form: {
        name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        paymentMethod: formData.payment_method
      },
      cart: items.map(item => ({
        name: item.product_name,
        selectedSize: item.size,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      total: calculatedTotal,
      shipping: parseFloat(formData.shipping_amount)
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Now update the status if it's not Pending, because /api/orders creates as Pending
        if (formData.status !== 'Pending') {
          const { orderId } = await res.json();
          await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: formData.status })
          });
        }
        router.push('/admin/orders');
      } else {
        const err = await res.json();
        showToast('Error: ' + err.error, 'error');
      }
    } catch {
      showToast('Network error. Check DB connection.', 'error');
    } finally {
      setLoading(false);
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
          animation: 'fadeInDown 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageLabel}>Sales</span>
          <h1 className={styles.pageTitle}>Add New Order</h1>
        </div>
        <Link href="/admin/orders" className={styles.backLink}>
          ← Back to Orders
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>

        {/* Customer Information */}
        <div className={styles.formSection} style={{ marginBottom: 24 }}>
          <div className={styles.formSectionTitle}>Customer Information</div>
          <div className={styles.formGrid3}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Customer Name <span className={styles.fieldRequired}>*</span></label>
              <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleFormChange} className={styles.fieldInput} placeholder="John Doe" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email <span className={styles.fieldRequired}>*</span></label>
              <input type="email" name="email" required value={formData.email} onChange={handleFormChange} className={styles.fieldInput} placeholder="john@example.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Phone <span className={styles.fieldRequired}>*</span></label>
              <input type="text" name="phone" required value={formData.phone} onChange={handleFormChange} className={styles.fieldInput} placeholder="+880..." />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className={styles.formSection} style={{ marginBottom: 24 }}>
          <div className={styles.formSectionTitle}>Shipping Address</div>
          <div className={styles.field} style={{ marginBottom: 20 }}>
            <label className={styles.fieldLabel}>Address <span className={styles.fieldRequired}>*</span></label>
            <input type="text" name="address" required value={formData.address} onChange={handleFormChange} className={styles.fieldInput} placeholder="Street Address" />
          </div>
          <div className={styles.formGrid2}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>City <span className={styles.fieldRequired}>*</span></label>
              <input type="text" name="city" required value={formData.city} onChange={handleFormChange} className={styles.fieldInput} placeholder="City" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>ZIP Code <span className={styles.fieldRequired}>*</span></label>
              <input type="text" name="zip" required value={formData.zip} onChange={handleFormChange} className={styles.fieldInput} placeholder="1234" />
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className={styles.formSection} style={{ marginBottom: 24 }}>
          <div className={styles.formSectionTitle}>Order Status & Payment</div>
          <div className={styles.formGrid3}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Status <span className={styles.fieldRequired}>*</span></label>
              <select name="status" value={formData.status} onChange={handleFormChange} className={styles.fieldSelect}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Payment Method <span className={styles.fieldRequired}>*</span></label>
              <select name="payment_method" value={formData.payment_method} onChange={handleFormChange} className={styles.fieldSelect}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m === 'cod' ? 'Cash on Delivery' : m === 'bkash' ? 'bKash' : 'Credit/Debit Card'}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Shipping Amount (৳)</label>
              <input type="number" name="shipping_amount" min="0" value={formData.shipping_amount} onChange={handleFormChange} className={styles.fieldInput} />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className={styles.formSection} style={{ marginBottom: 24 }}>
          <div className={styles.formSectionTitle}>Order Items</div>
          
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div className={styles.field} style={{ flex: 2 }}>
                <label className={styles.fieldLabel}>Product Name</label>
                <input type="text" required value={item.product_name} onChange={e => handleItemChange(idx, 'product_name', e.target.value)} className={styles.fieldInput} placeholder="Product Name" />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.fieldLabel}>Size</label>
                <input type="text" value={item.size} onChange={e => handleItemChange(idx, 'size', e.target.value)} className={styles.fieldInput} placeholder="Free Size" />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.fieldLabel}>Quantity</label>
                <input type="number" required min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className={styles.fieldInput} />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.fieldLabel}>Unit Price (৳)</label>
                <input type="number" required min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} className={styles.fieldInput} />
              </div>
              <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1} className={styles.secondaryBtn} style={{ padding: '11px', color: '#ef4444' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addItem} className={styles.secondaryBtn} style={{ marginTop: '10px' }}>
            <Plus size={16} style={{ marginRight: '4px' }} /> Add Another Item
          </button>

          <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
            Total Amount: ৳{calculatedTotal.toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.primaryBtn}>
            {loading ? '⏳ Saving…' : <><Check size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> Create Order</>}
          </button>
          <Link href="/admin/orders" className={styles.secondaryBtn}>
            Cancel
          </Link>
        </div>
      </form>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
