'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try { setWishlist(JSON.parse(localStorage.getItem('clothship_wishlist') || '[]')); }
    catch { setWishlist([]); }
  }, []);

  const removeItem = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('clothship_wishlist', JSON.stringify(updated));
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1, selectedSize: product.sizes[0] });
    localStorage.setItem('clothship_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    removeItem(product.id);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className={styles.empty}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love for later</p>
          <Link href="/shop" className={styles.shopBtn}>Browse Collection</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlist.map(item => (
            <div key={item.id} className={styles.card}>
              <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>✕</button>
              <Link href={`/product/${item.slug}`} className={styles.cardImageWrap}>
                <img src={item.image} alt={item.name} className={styles.cardImage} />
              </Link>
              <div className={styles.cardInfo}>
                <Link href={`/product/${item.slug}`} className={styles.cardName}>{item.name}</Link>
                <span className={styles.cardPrice}>৳{item.price.toLocaleString()}</span>
                <button className={styles.addToCartBtn} onClick={() => addToCart(item)}>Move to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
