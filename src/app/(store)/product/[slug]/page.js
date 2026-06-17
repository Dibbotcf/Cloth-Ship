'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './pdp.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('story');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const slideTimer = useRef(null);

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        if (typeof data.colors === 'string') data.colors = JSON.parse(data.colors);
        if (typeof data.sizes === 'string') data.sizes = JSON.parse(data.sizes);
        if (typeof data.gallery === 'string') {
          try { data.gallery = JSON.parse(data.gallery); } catch { data.gallery = []; }
        }
        if (!Array.isArray(data.gallery)) data.gallery = [];
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          const first = data.colors[0];
          const name = first.includes('|') ? first.split('|')[0] : first;
          setSelectedColor(name);
        }
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

  // Build full image list: cover + gallery
  const allImages = product
    ? [product.image, ...(product.gallery || [])].filter(Boolean)
    : [];

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (allImages.length <= 1) return;
    slideTimer.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % allImages.length);
    }, 5000);
    return () => clearInterval(slideTimer.current);
  }, [allImages.length]);

  const goTo = useCallback((idx) => {
    setActiveIdx(idx);
    setZoom(1);
    clearInterval(slideTimer.current);
    // Restart timer
    if (allImages.length > 1) {
      slideTimer.current = setInterval(() => {
        setActiveIdx(prev => (prev + 1) % allImages.length);
      }, 5000);
    }
  }, [allImages.length]);

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
    router.push('/cart');
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
      <div className={styles.breadcrumb} style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={() => window.history.back()} style={{background:'none', border:'none', cursor:'pointer', color:'var(--color-text-medium)', marginRight: 12, padding: 4, display: 'flex', alignItems: 'center'}} title="Go Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span style={{color: 'var(--color-text-dark)'}}>{product.name}</span>
        </div>
      </div>

      <div className={styles.productLayout}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img
              src={allImages[activeIdx] || product.image}
              alt={product.name}
              className={styles.mainImg}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            />
            {(product.is_new === 1 || product.is_new === true) && <span className={styles.badge}>New</span>}

            {/* Zoom controls — visible on hover */}
            <div className={styles.galleryControls}>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoom(z => Math.min(z + 0.3, 3))}
                title="Zoom In"
              >+</button>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoom(z => Math.max(z - 0.3, 1))}
                title="Zoom Out"
              >−</button>
            </div>

            {/* Slide dots — only when multiple images */}
            {allImages.length > 1 && (
              <div className={styles.slideDots}>
                {allImages.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.slideDot} ${i === activeIdx ? styles.slideDotActive : ''}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className={styles.thumbStrip}>
              {allImages.map((url, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  className={`${styles.thumb} ${i === activeIdx ? styles.thumbActive : ''}`}
                >
                  <img src={url} alt={`View ${i + 1}`} className={styles.thumbImg} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          <span className={styles.category}>{product.category.replace(/-/g, ' ')}</span>
          <h1 className={styles.productName}>{product.name}</h1>
          <div className={styles.pricing}>
            <span className={styles.price}>৳{parseFloat(product.price).toLocaleString()}</span>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <>
                <span className={styles.originalPrice}>৳{parseFloat(product.original_price).toLocaleString()}</span>
                <span className={styles.discount}>-{Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100)}% OFF</span>
              </>
            )}
          </div>
          <p className={styles.description}>{product.description}</p>

          {/* Color */}
          {product.colors && product.colors.length > 0 && (() => {
            const parseColor = (val) => {
              if (typeof val === 'string' && val.includes('|')) {
                const [name, hex] = val.split('|');
                return { name: name.trim(), hex: hex.trim() };
              }
              return { name: val, hex: '#888888' };
            };
            const parsedColors = product.colors.map(parseColor);
            return (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Color: <strong>{selectedColor || parsedColors[0]?.name}</strong></label>
                <div className={styles.colorSwatches}>
                  {parsedColors.map(({ name, hex }) => (
                    <span
                      key={name}
                      title={name}
                      onClick={() => setSelectedColor(name)}
                      className={styles.colorSwatch}
                      style={{
                        background: hex,
                        border: (selectedColor || parsedColors[0]?.name) === name ? '2.5px solid #a0522d' : '2px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transform: (selectedColor || parsedColors[0]?.name) === name ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

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
