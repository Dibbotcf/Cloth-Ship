'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './shop.module.css';
import ProductCardImage from '@/components/ProductCardImage';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    fabric: '',
    occasion: '',
    color: '',
    priceRange: '',
    sort: 'newest',
  });
  const [mobileFilters, setMobileFilters] = useState(false);

  // Sync filters when URL params change (e.g. clicking Women/Men nav from within shop)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || '',
      gender: searchParams.get('gender') || '',
      fabric: '',
      occasion: '',
    }));
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  // Base pool: products matching gender+category (but not fabric/occasion)
  // This makes fabric/occasion options contextual to the current gender/category selection
  const baseFiltered = useMemo(() => {
    let result = [...products];
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.gender) result = result.filter(p => p.gender === filters.gender);
    return result;
  }, [products, filters.category, filters.gender]);

  const fabricsList = useMemo(() => {
    const seen = new Set();
    baseFiltered.forEach(p => p.fabric && seen.add(p.fabric));
    return [...seen].sort();
  }, [baseFiltered]);

  const occasionsList = useMemo(() => {
    const seen = new Set();
    baseFiltered.forEach(p => p.occasion && seen.add(p.occasion));
    return [...seen].sort();
  }, [baseFiltered]);

  const filtered = useMemo(() => {
    let result = [...baseFiltered];
    if (filters.fabric) result = result.filter(p => p.fabric === filters.fabric);
    if (filters.occasion) result = result.filter(p => p.occasion === filters.occasion);
    if (filters.sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [baseFiltered, filters.fabric, filters.occasion, filters.sort]);

  const addToCart = (product, redirectUrl = '/cart') => {
    const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
    let sizes = product.sizes;
    if (typeof sizes === 'string') { try { sizes = JSON.parse(sizes); } catch (e) { sizes = ['Free Size']; } }
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1, selectedSize: Array.isArray(sizes) ? sizes[0] : 'Free Size', sizes });
    localStorage.setItem('clothship_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    router.push(redirectUrl);
  };

  const buyNow = (product) => {
    addToCart(product, '/checkout');
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
            {['women', 'men', 'unisex'].map(g => (
              <label key={g} className={styles.filterOption}>
                <input type="checkbox" checked={filters.gender === g} onChange={() => updateFilter('gender', g)} />
                <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
              </label>
            ))}
          </div>

          {fabricsList.length > 0 && (
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Fabric</h4>
              {fabricsList.map(f => (
                <label key={f} className={styles.filterOption}>
                  <input type="checkbox" checked={filters.fabric === f} onChange={() => updateFilter('fabric', f)} />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          )}

          {occasionsList.length > 0 && (
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Occasion</h4>
              {occasionsList.map(o => (
                <label key={o} className={styles.filterOption}>
                  <input type="checkbox" checked={filters.occasion === o} onChange={() => updateFilter('occasion', o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          )}

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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
