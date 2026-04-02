'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fabrics, occasions, colors as colorOptions } from '@/data/products';
import styles from './shop.module.css';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialGender = searchParams.get('gender') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: initialCategory,
    gender: initialGender,
    fabric: '',
    occasion: '',
    color: '',
    priceRange: '',
    sort: 'newest',
  });
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.gender) result = result.filter(p => p.gender === filters.gender);
    if (filters.fabric) result = result.filter(p => p.fabric === filters.fabric);
    if (filters.occasion) result = result.filter(p => p.occasion === filters.occasion);
    if (filters.sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [filters, products]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
    let sizes = product.sizes;
    if (typeof sizes === 'string') { try { sizes = JSON.parse(sizes); } catch (e) { sizes = ['Free Size']; } }
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1, selectedSize: Array.isArray(sizes) ? sizes[0] : 'Free Size', sizes });
    localStorage.setItem('clothship_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> / <span>Shop</span>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Shop All</h1>
        <p className={styles.pageDesc}>Discover our curated collection of traditional attire with a modern twist</p>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.filterToggle} onClick={() => setMobileFilters(!mobileFilters)}>
          ☰ Filters
        </button>
        <span className={styles.resultCount}>{filtered.length} products</span>
        <select className={styles.sortSelect} value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))}>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${mobileFilters ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filters</h3>
            <button onClick={() => setMobileFilters(false)} className={styles.sidebarClose}>✕</button>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Gender</h4>
            {['women', 'men'].map(g => (
              <label key={g} className={styles.filterOption}>
                <input type="checkbox" checked={filters.gender === g} onChange={() => updateFilter('gender', g)} />
                <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Fabric</h4>
            {fabrics.map(f => (
              <label key={f} className={styles.filterOption}>
                <input type="checkbox" checked={filters.fabric === f} onChange={() => updateFilter('fabric', f)} />
                <span>{f}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Occasion</h4>
            {occasions.map(o => (
              <label key={o} className={styles.filterOption}>
                <input type="checkbox" checked={filters.occasion === o} onChange={() => updateFilter('occasion', o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>

          <button className={styles.clearFilters} onClick={() => setFilters({ category: '', gender: '', fabric: '', occasion: '', color: '', priceRange: '', sort: 'newest' })}>
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            filtered.map(product => (
              <div key={product.id} className={styles.card}>
                  <Link href={`/product/${product.slug}`} className={styles.cardImageWrap}>
                  <img src={product.image || '/images/placeholder.png'} alt={product.name} className={styles.cardImage} />
                  {(product.is_new === 1) && <span className={styles.badge}>New</span>}
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span className={styles.badgeSale}>-{Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100)}%</span>
                  )}
                </Link>
                <div className={styles.cardHover}>
                  <button className={styles.quickAdd} onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardCategory}>{product.category.replace(/-/g, ' ')}</span>
                  <Link href={`/product/${product.slug}`} className={styles.cardName}>{product.name}</Link>
                  <div className={styles.cardPricing}>
                    <span className={styles.cardPrice}>৳{parseFloat(product.price).toLocaleString()}</span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <span className={styles.cardOriginal}>৳{parseFloat(product.original_price).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
