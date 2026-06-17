'use client';
import { useState, useEffect } from 'react';
import { Trash2, Edit, Check, X, Plus } from 'lucide-react';
import styles from '../admin.module.css';

const TABS = {
  categories: {
    label: 'Categories',
    api: '/api/admin/categories',
    singular: 'Category',
    hint: 'e.g. Kids Wear',
    slugHint: 'kids-wear'
  },
  fabrics: {
    label: 'Fabrics',
    api: '/api/admin/fabrics',
    singular: 'Fabric',
    hint: 'e.g. Pure Silk',
    slugHint: 'pure-silk'
  },
  occasions: {
    label: 'Occasions',
    api: '/api/admin/occasions',
    singular: 'Occasion',
    hint: 'e.g. Wedding Wear',
    slugHint: 'wedding-wear'
  }
};

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '' });
  const [newForm, setNewForm] = useState({ name: '', slug: '' });

  // Modal attributes list popup state
  const [modalItem, setModalItem] = useState(null);
  const [modalProducts, setModalProducts] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchItems();
    setAdding(false);
    setEditingId(null);
  }, [activeTab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(TABS[activeTab].api);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const openProductsModal = async (item) => {
    setModalItem(item);
    setModalLoading(true);
    setModalProducts([]);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (Array.isArray(data)) {
        let filtered = [];
        if (activeTab === 'categories') {
          filtered = data.filter(p => p.category === item.slug);
        } else if (activeTab === 'fabrics') {
          filtered = data.filter(p => p.fabric && p.fabric.toLowerCase() === item.name.toLowerCase());
        } else if (activeTab === 'occasions') {
          filtered = data.filter(p => p.occasion && p.occasion.toLowerCase() === item.name.toLowerCase());
        }
        setModalProducts(filtered);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: newForm.name,
      slug: newForm.slug || generateSlug(newForm.name)
    };

    try {
      const res = await fetch(TABS[activeTab].api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`${TABS[activeTab].singular} added successfully`);
        setNewForm({ name: '', slug: '' });
        setAdding(false);
        fetchItems();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleEditSubmit = async (id) => {
    try {
      const res = await fetch(`${TABS[activeTab].api}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        showToast(`${TABS[activeTab].singular} updated`);
        setEditingId(null);
        fetchItems();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete ${TABS[activeTab].singular.toLowerCase()} "${name}"?`)) return;
    try {
      const res = await fetch(`${TABS[activeTab].api}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`${TABS[activeTab].singular} deleted`);
        fetchItems();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

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
          <span className={styles.pageLabel}>Catalog Management</span>
          <h1 className={styles.pageTitle}>{TABS[activeTab].label}</h1>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Add {TABS[activeTab].singular}
          </button>
        )}
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #ede8e2', marginBottom: '24px', paddingBottom: '1px' }}>
        {Object.keys(TABS).map(tabKey => {
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                padding: '10px 24px',
                fontWeight: 700,
                fontSize: '14px',
                color: isActive ? '#a0522d' : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #a0522d' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s ease',
              }}
            >
              {TABS[tabKey].label}
            </button>
          );
        })}
      </div>

      {adding && (
        <form onSubmit={handleAddSubmit} className={styles.formCard} style={{ marginBottom: 24, padding: '20px' }}>
          <div className={styles.formSectionTitle}>Add New {TABS[activeTab].singular}</div>
          <div className={styles.formGrid2}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{TABS[activeTab].singular} Name *</label>
              <input 
                type="text" 
                required 
                value={newForm.name} 
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} 
                className={styles.fieldInput} 
                placeholder={TABS[activeTab].hint} 
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Slug (optional)</label>
              <input 
                type="text" 
                value={newForm.slug} 
                onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })} 
                className={styles.fieldInput} 
                placeholder={TABS[activeTab].slugHint} 
              />
            </div>
          </div>
          <div className={styles.formActions} style={{ marginTop: 16 }}>
            <button type="submit" className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={16} /> Save
            </button>
            <button type="button" onClick={() => setAdding(false)} className={styles.secondaryBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.card}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading {TABS[activeTab].label.toLowerCase()}...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <div className={styles.emptyTitle}>No {TABS[activeTab].label.toLowerCase()} yet</div>
            <div className={styles.emptySubtitle}>Create a {TABS[activeTab].singular.toLowerCase()} to organize your products.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Date Updated</th>
                  <th style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: '#b0a8a0', fontSize: 12, fontWeight: 600 }}>#{item.id}</td>
                    
                    {editingId === item.id ? (
                      <>
                        <td>
                          <input 
                            type="text" 
                            value={editForm.name} 
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className={styles.fieldInput} 
                            style={{ padding: '6px 10px' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editForm.slug} 
                            onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                            className={styles.fieldInput} 
                            style={{ padding: '6px 10px' }}
                          />
                        </td>
                        <td>—</td>
                        <td>—</td>
                        <td>
                          <div className={styles.actions}>
                            <button onClick={() => handleEditSubmit(item.id)} className={styles.editBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Check size={14} /> Save
                            </button>
                            <button onClick={() => setEditingId(null)} className={styles.deleteBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><strong style={{ fontSize: 13.5, color: '#1a1209' }}>{item.name}</strong></td>
                        <td><span style={{ fontSize: 13, color: '#666', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>{item.slug}</span></td>
                        <td>
                          <button 
                            onClick={() => openProductsModal(item)}
                            style={{
                              background: 'rgba(160, 82, 45, 0.08)',
                              border: '1px solid rgba(160, 82, 45, 0.18)',
                              color: '#a0522d',
                              padding: '5px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(160, 82, 45, 0.14)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(160, 82, 45, 0.08)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            title="Click to view products"
                          >
                            <span>📦</span> {item.product_count || 0} product{item.product_count !== 1 ? 's' : ''}
                          </button>
                        </td>
                        <td style={{ color: '#5a544d', fontSize: '13px', fontWeight: 500 }}>
                          {formatDate(item.created_at)}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button 
                              onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, slug: item.slug }); }} 
                              className={styles.editBtn} 
                              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => deleteItem(item.id, item.name)}
                              className={styles.deleteBtn}
                              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Popup for Products List */}
      {modalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26, 18, 9, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: 24, animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setModalItem(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: '650px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 48px rgba(26, 18, 9, 0.22)', overflow: 'hidden',
            animation: 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #f0ebe4', background: '#faf8f5'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#2d1f0e' }}>
                  Products under {TABS[activeTab].singular}
                </h3>
                <span style={{ fontSize: 12, color: '#8c8278', fontWeight: 600 }}>
                  &ldquo;{modalItem.name}&rdquo; &middot; {modalProducts.length} items
                </span>
              </div>
              <button 
                onClick={() => setModalItem(null)}
                style={{
                  background: '#f3f0ec', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#8c8278',
                  fontSize: 16, fontWeight: 'bold', transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e7e3dd'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f0ec'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, minHeight: '200px' }}>
              {modalLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', color: '#8c8278', fontWeight: 600 }}>
                  ⏳ Loading products...
                </div>
              ) : modalProducts.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: '#8c8278', textAlign: 'center' }}>
                  <span style={{ fontSize: 40, marginBottom: 10 }}>🛍️</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a1209' }}>No products assigned</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8c8278' }}>This {TABS[activeTab].singular.toLowerCase()} is currently empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {modalProducts.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: 12, borderRadius: 10, border: '1px solid #ede8e2',
                      background: '#fff', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#d5cdc3'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: 44, height: 56, borderRadius: 6, overflow: 'hidden', border: '1px solid #ede8e2', background: '#f5f5f5', flexShrink: 0 }}>
                        <img 
                          src={p.image || '/images/products/placeholder.png'} 
                          alt={p.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: '#1a1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </h4>
                        <span style={{ fontSize: 11, color: '#8c8278', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize' }}>
                          {p.category.replace(/-/g, ' ')}
                        </span>
                      </div>

                      {/* Price & Stock */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, color: '#a0522d', fontSize: 13.5 }}>
                          ৳{parseFloat(p.price).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: p.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 600, marginTop: 2 }}>
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ebe4', display: 'flex', justifyContent: 'flex-end', background: '#faf8f5' }}>
              <button 
                onClick={() => setModalItem(null)}
                className={styles.secondaryBtn}
                style={{ margin: 0 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
