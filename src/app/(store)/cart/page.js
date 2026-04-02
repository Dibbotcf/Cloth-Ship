'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './cart.module.css';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const loadCart = () => {
      try { setCart(JSON.parse(localStorage.getItem('clothship_cart') || '[]')); }
      catch { setCart([]); }
    };
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  const updateQuantity = (id, size, delta) => {
    const updated = cart.map(item => {
      if (item.id === id && item.selectedSize === size) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('clothship_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (id, size) => {
    const updated = cart.filter(item => !(item.id === id && item.selectedSize === size));
    setCart(updated);
    localStorage.setItem('clothship_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 3000 ? 0 : 150;
  const total = subtotal + shipping;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className={styles.empty}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h3>Your cart is empty</h3>
          <p>Discover our beautiful collection and add items to your cart</p>
          <Link href="/shop" className={styles.shopBtn}>Continue Shopping</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.items}>
            <div className={styles.itemsHeader}>
              <span>Product</span><span>Price</span><span>Quantity</span><span>Total</span><span></span>
            </div>
            {cart.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}-${idx}`} className={styles.item}>
                <div className={styles.itemProduct}>
                  <Link href={`/product/${item.slug}`} className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className={styles.itemDetails}>
                    <Link href={`/product/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                    <span className={styles.itemSize}>Size: {item.selectedSize}</span>
                  </div>
                </div>
                <span className={styles.itemPrice}>৳{item.price.toLocaleString()}</span>
                <div className={styles.itemQuantity}>
                  <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)}>+</button>
                </div>
                <span className={styles.itemTotal}>৳{(item.price * item.quantity).toLocaleString()}</span>
                <button className={styles.itemRemove} onClick={() => removeItem(item.id, item.selectedSize)}>✕</button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `৳${shipping}`}</span>
            </div>
            {shipping === 0 && <p className={styles.freeShipping}>🎉 You qualify for free shipping!</p>}
            <div className={styles.promoRow}>
              <input type="text" placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className={styles.promoInput} />
              <button className={styles.promoBtn}>Apply</button>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
            <Link href="/checkout" className={styles.checkoutBtn}>Proceed to Checkout</Link>
            <Link href="/shop" className={styles.continueLink}>← Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
}
