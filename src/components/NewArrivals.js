'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './NewArrivals.module.css';

export default function NewArrivals() {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNewProducts(data.filter(p => p.is_new === 1 || p.is_featured === 1).slice(0, 6));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
    let parsedSizes = product.sizes;
    if (typeof parsedSizes === 'string') {
      try { parsedSizes = JSON.parse(parsedSizes); } catch (e) { parsedSizes = ['Free Size']; }
    }
    const existing = cart.find(i => i.id === product.id);
    if (existing) { existing.quantity++; }
    else { cart.push({ ...product, quantity: 1, selectedSize: Array.isArray(parsedSizes) ? parsedSizes[0] : 'Free Size', sizes: parsedSizes }); }
    localStorage.setItem('clothship_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (loading) return <section className={styles.section}><div className={styles.container}><h2 className={styles.title}>New Arrivals</h2><p style={{textAlign: 'center'}}>Loading...</p></div></section>;

  return (
    <section className={styles.section} id="new-arrivals">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Just In</span>
          <h2 className={styles.title}>New Arrivals</h2>
          <Link href="/shop" className={styles.viewAll}>View All →</Link>
        </div>
        <div className={styles.grid}>
          {newProducts.map(product => (
            <div key={product.id} className={styles.card} id={`product-card-${product.id}`}>
              <Link href={`/product/${product.slug}`} className={styles.cardImageWrap}>
                <img src={product.image} alt={product.name} className={styles.cardImage} />
                {product.isNew && <span className={styles.badge}>New</span>}
                {product.originalPrice > product.price && (
                  <span className={styles.badgeSale}>-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                )}
              </Link>
              <div className={styles.cardHover}>
                <button className={styles.quickAdd} onClick={() => addToCart(product)}>Add to Cart</button>
                <Link href={`/product/${product.slug}`} className={styles.quickView}>Quick View</Link>
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardCategory}>{product.category.replace(/-/g, ' ')}</span>
                <Link href={`/product/${product.slug}`} className={styles.cardName}>{product.name}</Link>
                <div className={styles.cardPricing}>
                  <span className={styles.cardPrice}>৳{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className={styles.cardOriginal}>৳{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
