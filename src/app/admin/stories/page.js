'use client';
import { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2, Edit } from 'lucide-react';
import styles from '../admin.module.css';

const EMPTY = { title: '', author: '', location: '', rating: '', content: '', image: '', is_published: true };

export default function AdminStoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load stories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY); setEditingId(null); setShowForm(true); };
  const openEdit = (s) => {
    setForm({
      title: s.title || '', author: s.author || '', location: s.location || '',
      rating: s.rating || '', content: s.content || '', image: s.image || '',
      is_published: s.is_published === 1 || s.is_published === true,
    });
    setEditingId(s.id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, image: data.url }));
        showToast('Image uploaded');
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/stories/${editingId}` : '/api/admin/stories';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(editingId ? 'Story updated' : 'Story published');
        closeForm();
        fetchItems();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id, title) => {
    if (!window.confirm(`Delete story "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/stories/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Story deleted'); fetchItems(); }
      else showToast('Failed to delete', 'error');
    } catch {
      showToast('Network error', 'error');
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '10px', maxWidth: '360px',
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '13.5px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>{toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageLabel}>Content</span>
          <h1 className={styles.pageTitle}>Stories &amp; Reviews</h1>
        </div>
        {!showForm && (
          <button onClick={openAdd} className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Add Story
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formCard} style={{ marginBottom: 24, padding: 20 }}>
          <div className={styles.formSectionTitle}>{editingId ? 'Edit Story' : 'New Story / Review'}</div>

          <div className={styles.formGrid2}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Title / Headline *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={styles.fieldInput} placeholder="e.g. My wedding saree was perfect" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Author Name</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={styles.fieldInput} placeholder="e.g. Nusrat Jahan" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={styles.fieldInput} placeholder="e.g. Dhaka" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={styles.fieldInput} style={{ cursor: 'pointer' }}>
                <option value="">No rating (story)</option>
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★ (4)</option>
                <option value="3">★★★ (3)</option>
                <option value="2">★★ (2)</option>
                <option value="1">★ (1)</option>
              </select>
            </div>
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.fieldLabel}>Content *</label>
            <textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={styles.fieldInput} style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder="The customer's story or review…" />
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.fieldLabel}>Photo (optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {form.image && (
                <div style={{ position: 'relative', width: 88, height: 66, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0dbd5' }}>
                  <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setForm({ ...form, image: '' })} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>✕</button>
                </div>
              )}
              <label className={styles.secondaryBtn} style={{ cursor: 'pointer', margin: 0 }}>
                {uploading ? 'Uploading…' : form.image ? 'Replace photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#1a1209' }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#a0522d' }} />
            Published (visible on the website)
          </label>

          <div className={styles.formActions} style={{ marginTop: 20 }}>
            <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={16} /> {saving ? 'Saving…' : editingId ? 'Update' : 'Publish'}
            </button>
            <button type="button" onClick={closeForm} className={styles.secondaryBtn}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.card}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading stories…</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <div className={styles.emptyTitle}>No stories yet</div>
            <div className={styles.emptySubtitle}>Add a customer story or review to show on the website.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Photo</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th style={{ width: 90 }}>Rating</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th style={{ width: 120 }}>Date</th>
                  <th style={{ width: 130 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ width: 46, height: 46, borderRadius: 8, overflow: 'hidden', background: '#f5f0ea', border: '1px solid #ede8e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.image ? <img src={s.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18 }}>📝</span>}
                      </div>
                    </td>
                    <td><strong style={{ fontSize: 13.5, color: '#1a1209' }}>{s.title}</strong></td>
                    <td style={{ fontSize: 13, color: '#5a544d' }}>{s.author || '—'}{s.location ? `, ${s.location}` : ''}</td>
                    <td style={{ color: '#c5a55a', fontSize: 13, whiteSpace: 'nowrap' }}>{s.rating ? '★'.repeat(s.rating) : '—'}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                        background: s.is_published ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.15)',
                        color: s.is_published ? '#15803d' : '#64748b',
                      }}>
                        {s.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#5a544d' }}>{fmt(s.created_at)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openEdit(s)} className={styles.editBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => deleteItem(s.id, s.title)} className={styles.deleteBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
