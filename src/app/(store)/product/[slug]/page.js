'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './pdp.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('story');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    // Fetch individual product
    fetch(`/api/products/${params.slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        // Parse json fields
        if (typeof data.colors === 'string') data.colors = JSON.parse(data.colors);
        if (typeof data.sizes === 'string') data.sizes = JSON.parse(data.sizes);
        setProduct(data);
        
        // Fetch related products
        fetch('/api/products')
          .then(r => r.json())
          .then(all => {
             const rel = all.filter(p => p.id !== data.id && (p.gender === data.gender || p.category === data.category)).slice(0, 4);
             setRelated(rel);
          });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className={styles.page} style={{paddingTop: '200px', textAlign: 'center'}}>Loading...</div>;

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product not found</h2>
        <Link href="/shop" className={styles.backLink}>← Back to Shop</Link>
      </div>
    );
  }


  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
    const size = selectedSize || product.sizes[0];
    const existing = cart.find(i => i.id === product.id && i.selectedSize === size);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity, selectedSize: size });
    localStorage.setItem('clothship_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const addToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('clothship_wishlist') || '[]');
    if (!wishlist.find(i => i.id === product.id)) {
      wishlist.push(product);
      localStorage.setItem('clothship_wishlist', JSON.stringify(wishlist));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span>{product.name}</span>
      </div>

      <div className={styles.productLayout}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img src={product.image} alt={product.name} className={styles.mainImg} />
            {product.isNew && <span className={styles.badge}>New</span>}
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          <span className={styles.category}>{product.category.replace(/-/g, ' ')}</span>
          <h1 className={styles.productName}>{product.name}</h1>
          <div className={styles.pricing}>
            <span className={styles.price}>৳{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <>
                <span className={styles.originalPrice}>৳{product.originalPrice.toLocaleString()}</span>
                <span className={styles.discount}>-{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</span>
              </>
            )}
          </div>
          <p className={styles.description}>{product.description}</p>

          {/* Color */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>Color: <strong>{product.colors[0]}</strong></label>
            <div className={styles.colorSwatches}>
              {product.colors.map(c => (
                <span key={c} className={styles.colorSwatch} title={c} />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className={styles.optionGroup}>
            <div className={styles.sizeHeader}>
              <label className={styles.optionLabel}>Size</label>
              <button className={styles.sizeGuideBtn} onClick={() => setSizeGuideOpen(true)}>Size Guide</button>
            </div>
            <div className={styles.sizes}>
              {product.sizes.map(s => (
                <button key={s} className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeBtnActive : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className={`${styles.addToCart} ${addedToCart ? styles.added : ''}`} onClick={addToCart}>
              {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button className={styles.wishlistBtn} onClick={addToWishlist} title="Add to Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          {/* Details Tabs */}
          <div className={styles.tabs}>
            <div className={styles.tabHeaders}>
              {['story', 'material', 'shipping'].map(tab => (
                <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab === 'story' ? 'Product Story' : tab === 'material' ? 'Material & Care' : 'Shipping'}
                </button>
              ))}
            </div>
            <div className={styles.tabContent}>
              {activeTab === 'story' && <p>{product.story}</p>}
              {activeTab === 'material' && <p>{product.material}</p>}
              {activeTab === 'shipping' && <p>Free shipping across Bangladesh on orders above ৳3,000. Standard delivery takes 3-5 business days. Express delivery available for select areas in Dhaka.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => (
              <Link key={p.id} href={`/product/${p.slug}`} className={styles.relatedCard}>
                <div className={styles.relatedImageWrap}>
                  <img src={p.image} alt={p.name} className={styles.relatedImg} />
                </div>
                <div className={styles.relatedInfo}>
                  <span className={styles.relatedName}>{p.name}</span>
                  <span className={styles.relatedPrice}>৳{p.price.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className={styles.modal} onClick={() => setSizeGuideOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSizeGuideOpen(false)}>✕</button>
            <h3 className={styles.modalTitle}>Size Guide</h3>
            <table className={styles.sizeTable}>
              <thead><tr><th>Size</th><th>Chest (in)</th><th>Waist (in)</th><th>Length (in)</th></tr></thead>
              <tbody>
                <tr><td>S</td><td>36</td><td>30</td><td>28</td></tr>
                <tr><td>M</td><td>38</td><td>32</td><td>29</td></tr>
                <tr><td>L</td><td>40</td><td>34</td><td>30</td></tr>
                <tr><td>XL</td><td>42</td><td>36</td><td>31</td></tr>
                <tr><td>XXL</td><td>44</td><td>38</td><td>32</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
