'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, FolderOpen, Tag, Star, Check, Images, X, Package, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import CategorySelect from '@/components/CategorySelect';
import ColorPicker from '@/components/ColorPicker';
import AttributeSelect from '@/components/AttributeSelect';
import { fabrics as DEFAULT_FABRICS, occasions as DEFAULT_OCCASIONS } from '@/data/products';
import styles from '../../../admin.module.css';

const CATEGORIES = [
  { value: 'sarees', label: 'Sarees' },
  { value: 'salwar-kameez', label: 'Salwar Kameez' },
  { value: 'kurtas-women', label: 'Kurtas (Women)' },
  { value: 'panjabis', label: 'Panjabis' },
  { value: 'fatua', label: 'Fatua' },
  { value: 'waistcoats', label: 'Waistcoats' },
  { value: 'kurtas-men', label: 'Kurtas (Men)' },
  { value: 'accessories', label: 'Accessories' },
];

const GENDERS = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'unisex', label: 'Unisex' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileRef = useRef(null);
  const galleryRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [toast, setToast] = useState(null);

  const [stockItems, setStockItems] = useState([]);
  const [stockLoading, setStockLoading] = useState(true);

  // Fetch existing items from ledger for stock reference
  useEffect(() => {
    fetch('/api/admin/ledger/items')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setStockItems(list);
      })
      .catch(() => {})
      .finally(() => setStockLoading(false));
  }, []);

  const [formData, setFormData] = useState({
    name: '', price: '', original_price: '', category: 'sarees', gender: 'women',
    fabric: '', occasion: '', description: '', story: '', material: '',
    image: '', sizes: '', stock: 0,
    is_new: false, is_featured: false,
  });

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Could not fetch product details.');
        return res.json();
      })
      .then(data => {
        const colorsStr = typeof data.colors === 'string'
          ? JSON.parse(data.colors).join(', ')
          : (data.colors || []).join(', ');
        const sizesStr = typeof data.sizes === 'string'
          ? JSON.parse(data.sizes).join(', ')
          : (data.sizes || []).join(', ');

        let colorsArr = [];
        if (data.colors) {
          try {
            colorsArr = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors;
          } catch { colorsArr = []; }
        }

        let galleryArr = [];
        if (data.gallery) {
          try {
            galleryArr = typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery;
          } catch { galleryArr = []; }
        }

        setFormData({
          name: data.name || '',
          price: data.price || '',
          original_price: data.original_price || '',
          category: data.category || 'sarees',
          gender: data.gender || 'women',
          fabric: data.fabric || '',
          occasion: data.occasion || '',
          description: data.description || '',
          story: data.story || '',
          material: data.material || '',
          image: data.image || '',
          sizes: sizesStr,
          stock: data.stock || 0,
          is_new: data.is_new === 1,
          is_featured: data.is_featured === 1,
        });
        setSelectedColors(colorsArr);
        setImagePreview(data.image || null);
        setGallery(galleryArr);
      })
      .catch(err => setError(err.message))
      .finally(() => setInitialFetch(false));
  }, [params.id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, image: data.url }));
        showToast('Image uploaded successfully.');
      } else {
        showToast('Upload failed: ' + data.error, 'error');
      }
    } catch {
      showToast('Upload error.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setGalleryUploading(true);
    const uploaded = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) uploaded.push(data.url);
      } catch { /* skip */ }
    }
    if (uploaded.length) {
      setGallery(prev => [...prev, ...uploaded]);
      showToast(`${uploaded.length} image(s) added to gallery.`);
    }
    setGalleryUploading(false);
    e.target.value = '';
  };

  const removeGalleryImage = (url) => {
    setGallery(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: selectedColors.length > 0 ? selectedColors : ['Default'],
      stock: parseInt(formData.stock) || 0,
      gallery: gallery.length > 0 ? gallery : null,
    };

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const err = await res.json();
        showToast('Error: ' + err.error, 'error');
      }
    } catch {
      showToast('Network error. Check DB connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialFetch) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <div className={styles.pageTitleGroup}>
            <span className={styles.pageLabel}>Catalog</span>
            <h1 className={styles.pageTitle}>Edit Product</h1>
          </div>
          <Link href="/admin/products" className={styles.backLink}>← Back to Products</Link>
        </div>
        <div className={styles.formCard}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div className={styles.skeleton} style={{ height: 13, width: '20%', marginBottom: 8 }} />
              <div className={styles.skeleton} style={{ height: 44, borderRadius: 9 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Edit Product</h1>
          <Link href="/admin/products" className={styles.backLink}>← Back to Products</Link>
        </div>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠️</span>
          <div>
            <div className={styles.errorTitle}>Failed to Load Product</div>
            <div className={styles.errorMessage}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

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
          animation: 'fadeInDown 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageLabel}>Catalog</span>
          <h1 className={styles.pageTitle}>Edit: {formData.name}</h1>
        </div>
        <Link href="/admin/products" className={styles.backLink}>← Back to Products</Link>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <form onSubmit={handleSubmit} className={styles.formCard} style={{ flex: '1 1 600px', maxWidth: 'none', margin: 0 }}>

        {/* ── Cover Image Upload ── */}
        <div className={styles.formSection} style={{ marginBottom: 24 }}>
          <div className={styles.formSectionTitle}>Cover Image</div>
          <div className={styles.imageUploadArea}>
            <div className={styles.imagePreviewBox} onClick={() => fileRef.current.click()} title="Click to change image">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className={styles.imagePreviewPlaceholder}>
                  <span className={styles.imagePreviewPlaceholderIcon}><Camera size={32} strokeWidth={1.5} /></span>
                  <span>Click to upload</span>
                </div>
              )}
              {uploading && (
                <div className={styles.imageUploadOverlay}>
                  <span style={{ fontSize: 20 }}>⏳</span><span>Uploading…</span>
                </div>
              )}
            </div>
            <div className={styles.imageUploadControls}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => fileRef.current.click()} className={styles.primaryBtn} disabled={uploading} style={{ width: 'fit-content' }}>
                  {uploading ? '⏳ Uploading…' : <><FolderOpen size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />Change Image</>}
                </button>
                {(imagePreview || formData.image) && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: '' })); }}
                    style={{
                      padding: '9px 16px', borderRadius: 6, border: '1px solid #fca5a5',
                      background: '#fef2f2', color: '#b91c1c', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'background 0.15s ease'
                    }}
                    title="Remove cover image"
                  >
                    <X size={14} /> Remove
                  </button>
                )}
              </div>
              <span className={styles.fieldHint}>Or paste URL / path below</span>
              <input
                type="text" name="image" value={formData.image} className={styles.fieldInput}
                onChange={e => { handleChange(e); setImagePreview(e.target.value); }}
                placeholder="/images/products/my-product.jpg"
              />
            </div>
          </div>
        </div>

        {/* ── Gallery Upload ── */}
        <div className={styles.formSection} style={{ marginBottom: 24 }}>
          <div className={styles.formSectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Images size={16} /> Gallery <span style={{ fontWeight: 400, fontSize: 12, color: '#8c8278' }}>(Multiple product images shown on product page)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            {gallery.map((url, idx) => (
              <div key={url} style={{ position: 'relative', width: 90, height: 90, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0dbd5' }}>
                <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.6)', border: 'none',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div
              onClick={() => galleryRef.current.click()}
              style={{
                width: 90, height: 90, border: '2px dashed #c8bfb5', borderRadius: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#8c8278', fontSize: 12, gap: 4,
                background: '#faf9f7', transition: 'border-color 0.2s',
              }}
            >
              {galleryUploading ? <span>⏳</span> : <><Images size={20} /><span>Add</span></>}
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />
          </div>
          <span className={styles.fieldHint}>Upload multiple gallery images. Each will appear as a thumbnail on the product view page.</span>
        </div>

        {/* ── Name + Prices ── */}
        <div className={styles.formGrid3} style={{ marginBottom: 20 }}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Product Name <span className={styles.fieldRequired}>*</span></label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className={styles.fieldInput} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Price (৳) <span className={styles.fieldRequired}>*</span></label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} className={styles.fieldInput} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Original Price (৳)</label>
            <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} className={styles.fieldInput} />
          </div>
        </div>

        {/* ── Category + Gender + Stock ── */}
        <div className={styles.formGrid3} style={{ marginBottom: 20 }}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Category <span className={styles.fieldRequired}>*</span></label>
            <CategorySelect value={formData.category} onChange={handleChange} defaultCategories={CATEGORIES} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Gender <span className={styles.fieldRequired}>*</span></label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={styles.fieldSelect}>
              {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={14} /> Stock (Qty)
            </label>
            <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} className={styles.fieldInput} placeholder="0" />
            <span className={styles.fieldHint}>Available inventory count</span>
          </div>
        </div>

        {/* ── Fabric + Occasion ── */}
        <div className={styles.formGrid2} style={{ marginBottom: 20 }}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fabric</label>
            <AttributeSelect 
              value={formData.fabric} 
              onChange={handleChange} 
              name="fabric" 
              placeholder="Select or add fabric..." 
              apiEndpoint="/api/admin/fabrics" 
              defaultOptions={DEFAULT_FABRICS} 
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Occasion</label>
            <AttributeSelect 
              value={formData.occasion} 
              onChange={handleChange} 
              name="occasion" 
              placeholder="Select or add occasion..." 
              apiEndpoint="/api/admin/occasions" 
              defaultOptions={DEFAULT_OCCASIONS} 
            />
          </div>
        </div>

        {/* ── Sizes ── */}
        <div className={styles.field} style={{ marginBottom: 20 }}>
          <label className={styles.fieldLabel}>Sizes <span className={styles.fieldRequired}>*</span></label>
          <input type="text" name="sizes" required value={formData.sizes} onChange={handleChange} className={styles.fieldInput} placeholder="S, M, L, XL" />
          <span className={styles.fieldHint}>Comma-separated</span>
        </div>

        {/* ── Colors ── */}
        <div className={styles.field} style={{ marginBottom: 20 }}>
          <label className={styles.fieldLabel}>Colors <span className={styles.fieldRequired}>*</span></label>
          <ColorPicker value={selectedColors} onChange={setSelectedColors} />
        </div>

        {/* ── Description ── */}
        <div className={styles.field} style={{ marginBottom: 20 }}>
          <label className={styles.fieldLabel}>Short Description</label>
          <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className={styles.fieldTextarea} placeholder="A short, compelling product description shown under the product title..." />
        </div>

        {/* ── Product Story ── */}
        <div className={styles.field} style={{ marginBottom: 20 }}>
          <label className={styles.fieldLabel}>Product Story <span className={styles.fieldHint} style={{ fontWeight: 400 }}>(shown in "Product Story" tab on product page)</span></label>
          <textarea name="story" rows="4" value={formData.story} onChange={handleChange} className={styles.fieldTextarea} placeholder="Handwoven by master artisans..." />
        </div>

        {/* ── Material & Care ── */}
        <div className={styles.field} style={{ marginBottom: 28 }}>
          <label className={styles.fieldLabel}>Material & Care <span className={styles.fieldHint} style={{ fontWeight: 400 }}>(shown in "Material & Care" tab on product page)</span></label>
          <textarea name="material" rows="4" value={formData.material} onChange={handleChange} className={styles.fieldTextarea} placeholder="100% Pure Silk. Dry clean only..." />
        </div>

        {/* ── Flags ── */}
        <div className={styles.checkboxGroup} style={{ marginBottom: 28 }}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} className={styles.checkboxInput} />
            <Tag size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: '#f59e0b' }} /> Mark as <strong>New Arrival</strong>
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className={styles.checkboxInput} />
            <Star size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: '#eab308' }} /> Mark as <strong>Featured</strong>
          </label>
        </div>

        {/* ── Actions ── */}
        <div className={styles.formActions}>
          <button type="submit" disabled={loading || uploading} className={styles.primaryBtn}>
            {loading ? '⏳ Saving…' : <><Check size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />Update Product</>}
          </button>
          <Link href="/admin/products" className={styles.secondaryBtn}>Cancel</Link>
        </div>
      </form>

      {/* ── Stock Overview Panel ── */}
      <div style={{
        flex: '1 1 350px',
        position: 'sticky',
        top: 24,
        background: '#fff',
        border: '1px solid #ede8e2',
        borderRadius: 14,
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 20px',
          borderBottom: '1px solid #f0ebe4',
          background: '#faf8f5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} color="#a0522d" strokeWidth={2} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#2d1f0e', letterSpacing: '0.03em' }}>
              Current Stock Overview
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#8c8278',
              background: '#ede8e2', borderRadius: 10, padding: '2px 8px'
            }}>
              Reference while editing
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#a0a0a0' }}>
            {stockItems.length} product{stockItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Body */}
        {stockLoading ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                {[...Array(5)].map((__, j) => (
                  <div key={j} style={{ height: 12, flex: 1, borderRadius: 4, background: '#f0ebe4', animation: 'pulse 1.4s ease infinite' }} />
                ))}
              </div>
            ))}
          </div>
        ) : stockItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#a0a0a0', fontSize: 13 }}>
            No products yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#faf8f5' }}>
                  {['Item', 'Category', 'Purchased', 'Sold', 'In Stock', 'Invested'].map(h => (
                    <th key={h} style={{
                      padding: '8px 16px', textAlign: 'left',
                      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: '#8c8278',
                      borderBottom: '1px solid #f0ebe4'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item, idx) => {
                  const stock = item.units_in_stock ?? 0;
                  const stockColor = stock <= 0 ? '#dc2626' : stock <= 2 ? '#d97706' : '#16a34a';
                  const stockBg = stock <= 0 ? '#fef2f2' : stock <= 2 ? '#fffbeb' : '#f0fdf4';
                  
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: idx < stockItems.length - 1 ? '1px solid #f7f4f0' : 'none',
                        transition: 'background 0.15s',
                        background: String(item.id) === String(params.id) ? '#fff9f0' : '',
                      }}
                      onMouseEnter={e => { if (String(item.id) !== String(params.id)) e.currentTarget.style.background = '#fdf9f5' }}
                      onMouseLeave={e => { if (String(item.id) !== String(params.id)) e.currentTarget.style.background = '' }}
                    >
                      <td style={{ padding: '9px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#1a1209', fontSize: 13 }}>{item.name}</span>
                        {String(item.id) === String(params.id) && (
                          <span style={{ marginLeft: 6, fontSize: 10, background: '#a0522d', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Editing</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 16px', color: '#7a7a7a', fontSize: 12 }}>
                        {item.category || '—'}
                      </td>
                      <td style={{ padding: '9px 16px' }}>
                        {item.total_purchased} {item.unit}
                      </td>
                      <td style={{ padding: '9px 16px' }}>
                        {item.total_sold} {item.unit}
                      </td>
                      <td style={{ padding: '9px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 12,
                          background: stockBg, color: stockColor,
                          fontWeight: 700, fontSize: 12, border: `1px solid ${stockBg === '#fef2f2' ? '#fca5a5' : stockBg === '#fffbeb' ? '#fcd34d' : '#86efac'}`
                        }}>
                          {stock <= 0 ? <AlertCircle size={12} strokeWidth={2.5}/> : stock <= 2 ? <AlertTriangle size={12} strokeWidth={2.5}/> : <CheckCircle size={12} strokeWidth={2.5}/>} {stock}
                        </span>
                      </td>
                      <td style={{ padding: '9px 16px', fontWeight: 700, color: '#a0522d' }}>
                        ৳{parseFloat(item.total_invested || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
