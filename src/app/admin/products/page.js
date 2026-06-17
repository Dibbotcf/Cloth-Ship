'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, Tag, Edit, Trash2, SlidersHorizontal, Eye } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Search & Filter panels state
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    image: true,
    name: true,
    category: true,
    price: true,
    stock: false,
    gender: false,
    fabric: false,
    occasion: false,
    status: true,
    actions: true,
  });

  // Filter criteria state
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    fabric: '',
    occasion: '',
    statusFeatured: false,
    statusNew: false,
    stockStatus: 'all', // all, instock, lowstock, outofstock
  });

  // Dynamically loaded filter options lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [fabricsList, setFabricsList] = useState([]);
  const [occasionsList, setOccasionsList] = useState([]);

  useEffect(() => {
    fetchProducts();
    
    // Fetch categories, fabrics, and occasions for filters selection
    fetch('/api/admin/categories').then(r => r.json()).then(data => setCategoriesList(Array.isArray(data) ? data : [])).catch(() => {});
    fetch('/api/admin/fabrics').then(r => r.json()).then(data => setFabricsList(Array.isArray(data) ? data : [])).catch(() => {});
    fetch('/api/admin/occasions').then(r => r.json()).then(data => setOccasionsList(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Unable to connect to database. Please check your MySQL configuration.');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (res.ok) {
        await fetchProducts();
        showToast('Product deleted successfully.');
      } else {
        showToast('Failed to delete: ' + (body.error || 'Unknown error'), 'error');
      }
    } catch {
      showToast('Network error. Check DB connection.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Human-readable date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Dynamic filter logic using useMemo
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search input (Name, description, fabric, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    // Gender filter
    if (filters.gender) {
      result = result.filter(p => p.gender === filters.gender);
    }

    // Fabric filter
    if (filters.fabric) {
      result = result.filter(p => p.fabric && p.fabric.toLowerCase() === filters.fabric.toLowerCase());
    }

    // Occasion filter
    if (filters.occasion) {
      result = result.filter(p => p.occasion && p.occasion.toLowerCase() === filters.occasion.toLowerCase());
    }

    // Featured status checkbox
    if (filters.statusFeatured) {
      result = result.filter(p => p.is_featured === 1);
    }

    // New status checkbox
    if (filters.statusNew) {
      result = result.filter(p => p.is_new === 1);
    }

    // Stock count filter
    if (filters.stockStatus !== 'all') {
      if (filters.stockStatus === 'instock') {
        result = result.filter(p => p.stock > 2);
      } else if (filters.stockStatus === 'lowstock') {
        result = result.filter(p => p.stock > 0 && p.stock <= 2);
      } else if (filters.stockStatus === 'outofstock') {
        result = result.filter(p => p.stock === 0 || !p.stock);
      }
    }

    return result;
  }, [products, searchQuery, filters]);

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
          animation: 'fadeInDown 0.3s ease',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageLabel}>Catalog</span>
          <h1 className={styles.pageTitle}>Products</h1>
        </div>
        <Link href="/admin/products/new" className={styles.primaryBtn}>
          + Add New Product
        </Link>
      </div>

      {/* ── Control Toolbar ── */}
      <div style={{ 
        display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', 
        background: '#fff', padding: '12px 16px', borderRadius: '12px', 
        border: '1px solid #ede8e2', flexWrap: 'wrap' 
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search by Name, Description, or Fabric..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #e0dbd5',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c8278', fontSize: '14px' }}>🔍</span>
        </div>

        {/* Columns Dropdown Toggle */}
        <button
          onClick={() => { setShowColumnsDropdown(!showColumnsDropdown); setShowFiltersDropdown(false); }}
          style={{
            padding: '10px 16px',
            background: showColumnsDropdown ? 'rgba(160, 82, 45, 0.08)' : '#fff',
            border: '1px solid #e0dbd5',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            color: showColumnsDropdown ? '#a0522d' : '#2d1f0e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          <SlidersHorizontal size={14} />
          <span>Columns</span> <span>{showColumnsDropdown ? '▲' : '▼'}</span>
        </button>

        {/* Filters Dropdown Toggle */}
        <button
          onClick={() => { setShowFiltersDropdown(!showFiltersDropdown); setShowColumnsDropdown(false); }}
          style={{
            padding: '10px 16px',
            background: showFiltersDropdown ? 'rgba(160, 82, 45, 0.08)' : '#fff',
            border: '1px solid #e0dbd5',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            color: showFiltersDropdown ? '#a0522d' : '#2d1f0e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          <span>📊</span>
          <span>Filters</span> <span>{showFiltersDropdown ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* ── Columns Selector Panel ── */}
      {showColumnsDropdown && (
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#faf9f7', 
          padding: '14px 16px', borderRadius: '12px', border: '1px solid #ede8e2', 
          marginBottom: '16px', animation: 'fadeIn 0.2s ease-out' 
        }}>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#8c8278', width: '100%', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Choose Active Columns:
          </span>
          {Object.keys(visibleColumns).map(colKey => {
            const isActive = visibleColumns[colKey];
            const label = colKey.toUpperCase();
            return (
              <button
                key={colKey}
                onClick={() => setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: isActive ? '1px solid #a0522d' : '1px solid #e0dbd5',
                  background: isActive ? 'rgba(160, 82, 45, 0.08)' : '#fff',
                  color: isActive ? '#a0522d' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <span>{isActive ? '✕' : '+'}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filters Options Panel ── */}
      {showFiltersDropdown && (
        <div style={{ 
          background: '#faf9f7', padding: '18px 20px', borderRadius: '12px', 
          border: '1px solid #ede8e2', marginBottom: '16px', 
          animation: 'fadeIn 0.2s ease-out' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            
            {/* Category Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8c8278', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                style={{ 
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', 
                  fontSize: '13px', color: '#2d1f0e', outline: 'none', background: '#fff' 
                }}
              >
                <option value="">All Categories</option>
                {categoriesList.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Gender Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8c8278', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gender</label>
              <select
                value={filters.gender}
                onChange={e => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                style={{ 
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', 
                  fontSize: '13px', color: '#2d1f0e', outline: 'none', background: '#fff' 
                }}
              >
                <option value="">All Genders</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            {/* Fabric Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8c8278', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fabric</label>
              <select
                value={filters.fabric}
                onChange={e => setFilters(prev => ({ ...prev, fabric: e.target.value }))}
                style={{ 
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', 
                  fontSize: '13px', color: '#2d1f0e', outline: 'none', background: '#fff' 
                }}
              >
                <option value="">All Fabrics</option>
                {fabricsList.map(f => (
                  <option key={f.slug} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Occasion Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8c8278', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Occasion</label>
              <select
                value={filters.occasion}
                onChange={e => setFilters(prev => ({ ...prev, occasion: e.target.value }))}
                style={{ 
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', 
                  fontSize: '13px', color: '#2d1f0e', outline: 'none', background: '#fff' 
                }}
              >
                <option value="">All Occasions</option>
                {occasionsList.map(o => (
                  <option key={o.slug} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Stock status filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8c8278', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stock Status</label>
              <select
                value={filters.stockStatus}
                onChange={e => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                style={{ 
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', 
                  fontSize: '13px', color: '#2d1f0e', outline: 'none', background: '#fff' 
                }}
              >
                <option value="all">All Inventory</option>
                <option value="instock">In Stock (&gt; 2)</option>
                <option value="lowstock">Low Stock (&le; 2)</option>
                <option value="outofstock">Out of Stock (= 0)</option>
              </select>
            </div>

            {/* Status Flags */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#2d1f0e', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.statusFeatured}
                  onChange={e => setFilters(prev => ({ ...prev, statusFeatured: e.target.checked }))}
                />
                Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#2d1f0e', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.statusNew}
                  onChange={e => setFilters(prev => ({ ...prev, statusNew: e.target.checked }))}
                />
                New Arrival
              </label>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', borderTop: '1px solid #ede8e2', paddingTop: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8c8278', fontWeight: 600 }}>
              Found {filteredProducts.length} matching products
            </span>
            <button
              onClick={() => setFilters({ category: '', gender: '', fabric: '', occasion: '', statusFeatured: false, statusNew: false, stockStatus: 'all' })}
              style={{
                background: 'none', border: 'none', color: '#a0522d', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: '4px'
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* ── Table view card ── */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {visibleColumns.id && <th style={{ width: 50 }}>ID</th>}
                  {visibleColumns.image && <th style={{ width: 70 }}>Image</th>}
                  {visibleColumns.name && <th>Name</th>}
                  {visibleColumns.category && <th style={{ width: 140 }}>Category</th>}
                  {visibleColumns.price && <th style={{ width: 120 }}>Price</th>}
                  {visibleColumns.stock && <th style={{ width: 90 }}>Stock</th>}
                  {visibleColumns.gender && <th style={{ width: 90 }}>Gender</th>}
                  {visibleColumns.fabric && <th style={{ width: 110 }}>Fabric</th>}
                  {visibleColumns.occasion && <th style={{ width: 110 }}>Occasion</th>}
                  {visibleColumns.status && <th style={{ width: 130 }}>Status</th>}
                  {visibleColumns.actions && <th style={{ width: 140 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className={styles.loadingRows}>
                    {Object.keys(visibleColumns).map((colKey, idx) => {
                      if (!visibleColumns[colKey]) return null;
                      return (
                        <td key={colKey}>
                          <div className={styles.skeleton} style={{ height: 14, borderRadius: 6, width: idx === 0 ? 24 : idx === 1 ? 46 : '80%' }} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <div>
              <div className={styles.errorTitle}>Database Connection Error</div>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🧺</div>
            <div className={styles.emptyTitle}>No matching products</div>
            <div className={styles.emptySubtitle}>Try adjusting your search query or filters layout.</div>
            {(searchQuery || Object.values(filters).some(Boolean) || filters.stockStatus !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ category: '', gender: '', fabric: '', occasion: '', statusFeatured: false, statusNew: false, stockStatus: 'all' });
                }}
                className={styles.primaryBtn} 
                style={{ marginTop: 12 }}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {visibleColumns.id && <th style={{ width: 50 }}>ID</th>}
                  {visibleColumns.image && <th style={{ width: 70 }}>Image</th>}
                  {visibleColumns.name && <th>Name</th>}
                  {visibleColumns.category && <th style={{ width: 140 }}>Category</th>}
                  {visibleColumns.price && <th style={{ width: 120 }}>Price</th>}
                  {visibleColumns.stock && <th style={{ width: 90 }}>Stock</th>}
                  {visibleColumns.gender && <th style={{ width: 90 }}>Gender</th>}
                  {visibleColumns.fabric && <th style={{ width: 110 }}>Fabric</th>}
                  {visibleColumns.occasion && <th style={{ width: 110 }}>Occasion</th>}
                  {visibleColumns.status && <th style={{ width: 130 }}>Status</th>}
                  {visibleColumns.actions && <th style={{ width: 140 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    {/* ID */}
                    {visibleColumns.id && <td style={{ color: '#b0a8a0', fontSize: 12, fontWeight: 600 }}>#{product.id}</td>}
                    
                    {/* Image */}
                    {visibleColumns.image && (
                      <td>
                        {product.image && !product.image.includes('placeholder') ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className={styles.productThumb}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className={styles.productThumbPlaceholder} style={{ display: (product.image && !product.image.includes('placeholder')) ? 'none' : 'flex' }}>
                          👗
                        </div>
                      </td>
                    )}
                    
                    {/* Name */}
                    {visibleColumns.name && (
                      <td>
                        <strong style={{ fontSize: 13.5, color: '#1a1209', display: 'block' }}>{product.name}</strong>
                        {product.fabric && <span style={{ fontSize: 11.5, color: '#a0a0a0', marginTop: 2, display: 'block' }}>{product.fabric}</span>}
                      </td>
                    )}
                    
                    {/* Category */}
                    {visibleColumns.category && (
                      <td style={{ textTransform: 'capitalize', fontSize: 13 }}>
                        {product.category.replace(/-/g, ' ')}
                      </td>
                    )}
                    
                    {/* Price */}
                    {visibleColumns.price && (
                      <td>
                        <strong style={{ color: 'var(--color-primary)', fontSize: 14 }}>
                          ৳{parseFloat(product.price).toLocaleString()}
                        </strong>
                        {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                          <div style={{ fontSize: 11.5, color: '#c0b8b0', textDecoration: 'line-through', marginTop: 2 }}>
                            ৳{parseFloat(product.original_price).toLocaleString()}
                          </div>
                        )}
                      </td>
                    )}
                    
                    {/* Stock */}
                    {visibleColumns.stock && (
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: product.stock > 2 ? '#f0fdf4' : product.stock > 0 ? '#fffbeb' : '#fef2f2',
                          color: product.stock > 2 ? '#16a34a' : product.stock > 0 ? '#d97706' : '#dc2626',
                          border: `1px solid ${product.stock > 2 ? 'rgba(34,197,94,0.2)' : product.stock > 0 ? 'rgba(217,119,6,0.2)' : 'rgba(220,38,38,0.2)'}`
                        }}>
                          {product.stock || 0} qty
                        </span>
                      </td>
                    )}
                    
                    {/* Gender */}
                    {visibleColumns.gender && (
                      <td style={{ textTransform: 'capitalize', fontSize: 13, color: '#5a544d' }}>
                        {product.gender || '—'}
                      </td>
                    )}
                    
                    {/* Fabric */}
                    {visibleColumns.fabric && (
                      <td style={{ fontSize: 13, color: '#5a544d' }}>
                        {product.fabric || '—'}
                      </td>
                    )}
                    
                    {/* Occasion */}
                    {visibleColumns.occasion && (
                      <td style={{ fontSize: 13, color: '#5a544d' }}>
                        {product.occasion || '—'}
                      </td>
                    )}
                    
                    {/* Status badges */}
                    {visibleColumns.status && (
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {product.is_featured === 1 && (
                            <span className={`${styles.badge} ${styles.badgeFeatured}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Star size={12} strokeWidth={2.5} /> Featured
                            </span>
                          )}
                          {product.is_new === 1 && (
                            <span className={`${styles.badge} ${styles.badgeNew}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Tag size={12} strokeWidth={2.5} /> New
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    
                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td>
                        <div className={styles.actions}>
                          <Link href={`/admin/products/edit/${product.id}`} className={styles.editBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Edit size={14} strokeWidth={2} /> Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className={styles.deleteBtn}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                          >
                            {deletingId === product.id ? '⏳' : <Trash2 size={16} strokeWidth={2} />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
