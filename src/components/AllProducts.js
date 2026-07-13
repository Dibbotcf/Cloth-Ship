'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './AllProducts.module.css';
import ProductCardImage from './ProductCardImage';

const PREVIEW_COUNT = 8;

export default function AllProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product, redirectUrl = '/cart') => {
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
    router.push(redirectUrl);
  };

  const buyNow = (product) => {
    addToCart(product, '/checkout');
  };

  if (loading) return <section className={styles.section}><div className={styles.container}><h2 className={styles.title}>All Products</h2><p style={{textAlign: 'center'}}>Loading...</p></div></section>;

  return (
    <section className={styles.section} id="all-products">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Explore Everything</span>
          <h2 className={styles.title}>Shop The Collection</h2>
          <Link href="/shop" className={styles.viewAll}>View All →</Link>
        </div>
        <div className={styles.grid}>
          {allProducts.slice(0, PREVIEW_COUNT).map(product => (
            <div key={product.id} className={styles.card} id={`product-card-${product.id}`}>
              <Link href={`/product/${product.slug}`} className={styles.cardLinkOverlay} aria-label={`View ${product.name}`} />
              <div className={styles.cardImageWrap}>
                <ProductCardImage product={product} className={styles.cardImage} />
                {(product.is_new === 1) && <span className={styles.badge}>New</span>}
                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                  <span className={styles.badgeSale}>-{Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100)}%</span>
                )}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                  <span className={styles.cardCategory}>{product.category.replace(/-/g, ' ')}</span>
                  <span className={styles.cardName}>{product.name}</span>
                  <div className={styles.cardPricing}>
                    <span className={styles.cardPrice}>৳{parseFloat(product.price).toLocaleString()}</span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <span className={styles.cardOriginal}>৳{parseFloat(product.original_price).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.actionBtnOutline} onClick={(e) => { e.preventDefault(); addToCart(product); }}>Add to Cart</button>
                  <button className={styles.actionBtnSolid} onClick={(e) => { e.preventDefault(); buyNow(product); }}>Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {allProducts.length > PREVIEW_COUNT && (
          <div className={styles.viewAllWrap}>
            <Link href="/shop" className={styles.viewAllBtn}>View All Products →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
