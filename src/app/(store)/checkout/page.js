'use client';
import { useState, useEffect } from 'react';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: '', paymentMethod: 'cod',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('clothship_cart') || '[]')); }
    catch { setCart([]); }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 3000 ? 0 : 150;
  const total = subtotal + shipping;

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const placeOrder = () => {
    setOrderPlaced(true);
    localStorage.setItem('clothship_cart', '[]');
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (orderPlaced) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping with Cloth Ship. We&apos;ll send a confirmation to your email.</p>
          <a href="/" className={styles.homeBtn}>Return Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Checkout</h1>

      {/* Progress */}
      <div className={styles.progress}>
        {['Shipping', 'Payment', 'Review'].map((label, i) => (
          <div key={label} className={`${styles.progressStep} ${step >= i + 1 ? styles.progressActive : ''}`}>
            <span className={styles.progressNum}>{i + 1}</span>
            <span className={styles.progressLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.formSection}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Shipping Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.field}><label>Full Name</label><input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Your full name" /></div>
                <div className={styles.field}><label>Email</label><input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="your@email.com" /></div>
                <div className={styles.field}><label>Phone</label><input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+880..." /></div>
                <div className={`${styles.field} ${styles.fieldFull}`}><label>Address</label><input type="text" value={form.address} onChange={e => updateForm('address', e.target.value)} placeholder="Street address" /></div>
                <div className={styles.field}><label>City</label><input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="City" /></div>
                <div className={styles.field}><label>ZIP Code</label><input type="text" value={form.zip} onChange={e => updateForm('zip', e.target.value)} placeholder="1234" /></div>
              </div>
              <button className={styles.nextBtn} onClick={() => setStep(2)}>Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Payment Method</h3>
              <div className={styles.paymentOptions}>
                {[{ id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' }, { id: 'bkash', label: 'bKash', desc: 'Mobile payment' }, { id: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard' }].map(opt => (
                  <label key={opt.id} className={`${styles.paymentOption} ${form.paymentMethod === opt.id ? styles.paymentActive : ''}`}>
                    <input type="radio" name="payment" value={opt.id} checked={form.paymentMethod === opt.id} onChange={e => updateForm('paymentMethod', e.target.value)} />
                    <div><strong>{opt.label}</strong><br /><span>{opt.desc}</span></div>
                  </label>
                ))}
              </div>
              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button className={styles.nextBtn} onClick={() => setStep(3)}>Review Order</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Order Review</h3>
              <div className={styles.reviewSection}>
                <h4>Shipping to:</h4>
                <p>{form.name}<br />{form.address}, {form.city} {form.zip}<br />{form.phone}</p>
              </div>
              <div className={styles.reviewSection}>
                <h4>Payment:</h4>
                <p>{form.paymentMethod === 'cod' ? 'Cash on Delivery' : form.paymentMethod === 'bkash' ? 'bKash' : 'Credit/Debit Card'}</p>
              </div>
              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
                <button className={styles.placeOrderBtn} onClick={placeOrder}>Place Order — ৳{total.toLocaleString()}</button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          {cart.map((item, idx) => (
            <div key={idx} className={styles.summaryItem}>
              <img src={item.image} alt={item.name} className={styles.summaryImg} />
              <div>
                <span className={styles.summaryName}>{item.name}</span>
                <span className={styles.summaryMeta}>Size: {item.selectedSize} × {item.quantity}</span>
              </div>
              <span className={styles.summaryPrice}>৳{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className={styles.summaryRow}><span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
          <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'Free' : `৳${shipping}`}</span></div>
          <div className={styles.summaryTotalRow}><span>Total</span><span>৳{total.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}
