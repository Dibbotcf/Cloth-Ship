'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminStyles from '../../admin.module.css';
import s from '../ledger.module.css';
import { ShoppingBag, FileText, Shirt, Tag, Plus, Check, XCircle, CheckCircle2, Trash2, BarChart2, AlertTriangle, AlertCircle, CheckCircle, Pencil, X } from 'lucide-react';

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];

const emptyForm = () => ({ item_id: '', purchase_date: today(), supplier: '', quantity: '', unit_cost: '', note: '' });

export default function PurchasesPage() {
  const [purchases, setPurchases]   = useState([]);
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]           = useState(null);
  // Edit state
  const [editingPurchase, setEditingPurchase] = useState(null); // the purchase being edited
  const [editForm, setEditForm] = useState(null);

  const [form, setForm] = useState(emptyForm());
  const [newItemForm, setNewItemForm] = useState({ name: '', category: '', sku: '', unit: 'piece' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, iRes] = await Promise.all([
        fetch('/api/admin/ledger/purchases'),
        fetch('/api/admin/ledger/items'),
      ]);
      const [pData, iData] = await Promise.all([pRes.json(), iRes.json()]);
      if (!pRes.ok) throw new Error(pData.error);
      setPurchases(Array.isArray(pData) ? pData : []);
      setItems(Array.isArray(iData) ? iData : []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditChange = e => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const totalCostPreview = form.quantity && form.unit_cost
    ? (parseFloat(form.quantity) * parseFloat(form.unit_cost)).toFixed(2)
    : null;

  const editTotalCostPreview = editForm?.quantity && editForm?.unit_cost
    ? (parseFloat(editForm.quantity) * parseFloat(editForm.unit_cost)).toFixed(2)
    : null;

  const selectedItem = items.find(i => String(i.id) === String(form.item_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_id) { showToast('Please select an item.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/ledger/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: parseInt(form.quantity), unit_cost: parseFloat(form.unit_cost) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Purchase recorded. Total: ${fmt(data.total_cost)}`);
      setForm(emptyForm());
      setFormOpen(false);
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setSubmitting(false); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemForm.name.trim()) { showToast('Item name required.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/ledger/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('New item added to catalog.');
      setNewItemForm({ name: '', category: '', sku: '', unit: 'piece' });
      setItemFormOpen(false);
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase? This will affect KPIs.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/ledger/purchases/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Purchase deleted.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setDeletingId(null); }
  };

  const startEdit = (p) => {
    setEditingPurchase(p.id);
    setEditForm({
      purchase_date: p.purchase_date ? p.purchase_date.split('T')[0] : today(),
      supplier: p.supplier || '',
      quantity: String(p.quantity),
      unit_cost: String(p.unit_cost),
      note: p.note || '',
    });
  };

  const cancelEdit = () => { setEditingPurchase(null); setEditForm(null); };

  const handleEditSubmit = async (id) => {
    if (!editForm.quantity || !editForm.unit_cost) { showToast('Quantity and Unit Cost are required.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/ledger/purchases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_date: editForm.purchase_date,
          supplier: editForm.supplier,
          quantity: parseInt(editForm.quantity),
          unit_cost: parseFloat(editForm.unit_cost),
          note: editForm.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Purchase updated successfully.');
      cancelEdit();
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const totalInvested = purchases.reduce((sum, p) => sum + Number(p.total_cost), 0);

  return (
    <div>
      {toast && (
        <div className={`${s.toast} ${toast.type === 'error' ? s.toastError : s.toastSuccess}`}>
          <span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
            {toast.type === 'error' ? <XCircle size={18} strokeWidth={2} /> : <CheckCircle2 size={18} strokeWidth={2} />}
          </span>
          {toast.msg}
        </div>
      )}

      <div className={adminStyles.pageHeader}>
        <div className={adminStyles.pageTitleGroup}>
          <span className={adminStyles.pageLabel}>Accounting</span>
          <h1 className={adminStyles.pageTitle}>Purchases</h1>
        </div>
        <Link href="/admin/ledger" className={adminStyles.backLink}>← Ledger Dashboard</Link>
      </div>

      {/* Summary */}
      <div className={s.kpiGrid} style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 24 }}>
        <div className={`${s.kpiCard} ${s.stock}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Total Invested</span>
              <span className={s.kpiValue}>{fmt(totalInvested)}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.stock}`}><ShoppingBag size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
        <div className={`${s.kpiCard} ${s.cash}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Total Purchases</span>
              <span className={s.kpiValue} style={{ fontSize: '1.7rem' }}>{purchases.length}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.cash}`}><FileText size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
        <div className={`${s.kpiCard} ${s.revenue}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Item Types</span>
              <span className={s.kpiValue} style={{ fontSize: '1.7rem' }}>{items.length}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.revenue}`}><Shirt size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
      </div>

      {/* Add New Item Form */}
      <div className={s.formPanel} style={{ marginBottom: 16 }}>
        <div className={s.formPanelHeader} onClick={() => setItemFormOpen(o => !o)}>
          <span className={s.formPanelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={18} strokeWidth={2} /> Add New Item to Catalog
          </span>
          <span className={`${s.formPanelToggle} ${itemFormOpen ? s.open : ''}`}>+</span>
        </div>
        {itemFormOpen && (
          <form onSubmit={handleAddItem} className={s.formPanelBody}>
            <div className={`${s.formRow} ${s.cols4}`}>
              <div className={s.formField} style={{ gridColumn: '1 / 3' }}>
                <label className={s.formLabel}>Item Name <span className={s.formRequired}>*</span></label>
                <input type="text" name="name" value={newItemForm.name} onChange={e => setNewItemForm(p => ({...p, name: e.target.value}))}
                  className={s.formInput} placeholder="e.g. Red Jamdani Saree" required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Category</label>
                <input type="text" name="category" value={newItemForm.category} onChange={e => setNewItemForm(p => ({...p, category: e.target.value}))}
                  className={s.formInput} placeholder="Jamdani, Katan…" />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Unit</label>
                <select name="unit" value={newItemForm.unit} onChange={e => setNewItemForm(p => ({...p, unit: e.target.value}))} className={s.formSelect}>
                  <option value="piece">Piece</option>
                  <option value="lot">Lot</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>
            </div>
            <div className={s.formActions}>
              <button type="submit" disabled={submitting} className={adminStyles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {submitting ? '⏳ Saving…' : <><Check size={16} strokeWidth={2.5} /> Add Item</>}
              </button>
              <button type="button" onClick={() => setItemFormOpen(false)} className={adminStyles.secondaryBtn}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Add Purchase Form */}
      <div className={s.formPanel} style={{ marginBottom: 24 }}>
        <div className={s.formPanelHeader} onClick={() => setFormOpen(o => !o)}>
          <span className={s.formPanelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={18} strokeWidth={2} /> Record a Purchase
          </span>
          <span className={`${s.formPanelToggle} ${formOpen ? s.open : ''}`}>+</span>
        </div>
        {formOpen && (
          <form onSubmit={handleSubmit} className={s.formPanelBody}>
            <div className={`${s.formRow} ${s.cols2}`}>
              <div className={s.formField}>
                <label className={s.formLabel}>Item <span className={s.formRequired}>*</span></label>
                <select name="item_id" value={form.item_id} onChange={handleChange} className={s.formSelect} required>
                  <option value="">— Select item —</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit}) — Stock: {i.units_in_stock}
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <span className={s.formHint}>
                    Current stock: <strong>{selectedItem.units_in_stock}</strong> {selectedItem.item_unit || 'piece(s)'}
                  </span>
                )}
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Purchase Date <span className={s.formRequired}>*</span></label>
                <input type="date" name="purchase_date" value={form.purchase_date} onChange={handleChange} className={s.formInput} required />
              </div>
            </div>

            <div className={`${s.formRow} ${s.cols4}`}>
              <div className={s.formField}>
                <label className={s.formLabel}>Quantity <span className={s.formRequired}>*</span></label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={s.formInput} placeholder="10" min="1" required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Unit Cost (৳) <span className={s.formRequired}>*</span></label>
                <input type="number" name="unit_cost" value={form.unit_cost} onChange={handleChange} className={s.formInput} placeholder="1252" min="0.01" step="0.01" required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Total Cost</label>
                <div style={{ padding: '10px 13px', borderRadius: 9, background: '#faf9f7', border: '1.5px solid #e8e0d8', fontWeight: 700, color: 'var(--color-primary)', fontSize: 14 }}>
                  {totalCostPreview ? fmt(totalCostPreview) : '—'}
                </div>
                <span className={s.formHint}>Auto-computed</span>
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Supplier</label>
                <input type="text" name="supplier" value={form.supplier} onChange={handleChange} className={s.formInput} placeholder="Supplier name" />
              </div>
            </div>

            <div className={s.formField}>
              <label className={s.formLabel}>Note (optional)</label>
              <input type="text" name="note" value={form.note} onChange={handleChange} className={s.formInput} placeholder="e.g. Dhaka market, lot 12" />
            </div>

            <div className={s.formActions}>
              <button type="submit" disabled={submitting} className={adminStyles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {submitting ? '⏳ Saving…' : <><Check size={16} strokeWidth={2.5} /> Record Purchase</>}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className={adminStyles.secondaryBtn}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Purchases Table */}
      <div className={s.tableCard}>
        <div className={s.tableCardHeader}>
          <span className={s.tableCardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShoppingBag size={18} strokeWidth={2} /> Purchase History
          </span>
          <span className={s.tableCount}>{purchases.length} records</span>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                {[...Array(6)].map((__, j) => (
                  <div key={j} className={s.skeleton} style={{ height: 13, flex: 1 }} />
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={adminStyles.errorBox} style={{ margin: 20 }}>
            <span>⚠️</span>
            <div><div className={adminStyles.errorTitle}>Error</div><div className={adminStyles.errorMessage}>{error}</div></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon} style={{ background: 'none', border: 'none', width: 'auto', height: 'auto', marginBottom: 12 }}>
              <ShoppingBag size={48} strokeWidth={1} color="#d4ccbc" />
            </div>
            <div className={s.emptyTitle}>No purchases recorded</div>
            <div className={s.emptySub}>First add an item to the catalog, then record a purchase above.</div>
          </div>
        ) : (
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, idx) => (
                  editingPurchase === p.id ? (
                    /* ── Inline Edit Row ── */
                    <tr key={p.id} style={{ background: '#fffbf5' }}>
                      <td style={{ color: '#b0a8a0', fontSize: 12 }}>{purchases.length - idx}</td>
                      <td>
                        <input
                          type="date" name="purchase_date" value={editForm.purchase_date}
                          onChange={handleEditChange}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: '100%' }}
                        />
                      </td>
                      <td>
                        <strong style={{ fontSize: 13.5, color: '#1a1209' }}>{p.item_name}</strong>
                      </td>
                      <td>
                        <input
                          type="text" name="supplier" value={editForm.supplier}
                          onChange={handleEditChange} placeholder="Supplier"
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: '100%' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number" name="quantity" value={editForm.quantity} min="1"
                          onChange={handleEditChange}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: 70 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number" name="unit_cost" value={editForm.unit_cost} min="0.01" step="0.01"
                          onChange={handleEditChange}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: 80 }}
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {editTotalCostPreview ? fmt(editTotalCostPreview) : '—'}
                      </td>
                      <td>
                        <input
                          type="text" name="note" value={editForm.note}
                          onChange={handleEditChange} placeholder="Note"
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: '100%' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleEditSubmit(p.id)}
                            disabled={submitting}
                            style={{
                              padding: '5px 10px', borderRadius: 6, border: 'none',
                              background: '#16a34a', color: '#fff', fontSize: 12,
                              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            {submitting ? '⏳' : <><Check size={13} /> Save</>}
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: '5px 10px', borderRadius: 6, border: '1px solid #e0dbd5',
                              background: '#fff', color: '#666', fontSize: 12,
                              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* ── Normal Row ── */
                    <tr key={p.id}>
                      <td style={{ color: '#b0a8a0', fontSize: 12 }}>{purchases.length - idx}</td>
                      <td style={{ color: '#7a7a7a', whiteSpace: 'nowrap' }}>
                        {new Date(p.purchase_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <strong style={{ fontSize: 13.5, color: '#1a1209' }}>{p.item_name}</strong>
                      </td>
                      <td style={{ color: '#7a7a7a', fontSize: 12 }}>{p.supplier || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{p.quantity} <span style={{ fontSize: 11, color: '#a0a0a0' }}>{p.item_unit}</span></td>
                      <td style={{ color: '#5a5a5a' }}>{fmt(p.unit_cost)}</td>
                      <td className={s.amountCost}>{fmt(p.total_cost)}</td>
                      <td style={{ color: '#7a7a7a', fontSize: 12 }}>{p.note || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => startEdit(p)}
                            style={{
                              padding: '5px 10px', borderRadius: 6, border: '1px solid #d6c8bc',
                              background: '#fff', color: '#6b4c2a', fontSize: 12,
                              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                              transition: 'background 0.15s'
                            }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className={s.deleteBtn}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            {deletingId === p.id ? '⏳' : <Trash2 size={14} strokeWidth={2} />} Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Stock Overview */}
      {items.length > 0 && (
        <div className={s.tableCard} style={{ marginTop: 20 }}>
          <div className={s.tableCardHeader}>
            <span className={s.tableCardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={18} strokeWidth={2} /> Stock Overview (per item)
            </span>
          </div>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Purchased</th>
                  <th>Sold</th>
                  <th>In Stock</th>
                  <th>Invested</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const stockCls = item.units_in_stock <= 0 ? s.stockPillOut : item.units_in_stock <= 2 ? s.stockPillLow : s.stockPillOk;
                  return (
                    <tr key={item.id}>
                      <td><strong style={{ color: '#1a1209' }}>{item.name}</strong></td>
                      <td style={{ color: '#7a7a7a', fontSize: 12 }}>{item.category || '—'}</td>
                      <td>{item.total_purchased} {item.unit}</td>
                      <td>{item.total_sold} {item.unit}</td>
                      <td>
                        <span className={`${s.stockPill} ${stockCls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {item.units_in_stock <= 0 ? <AlertCircle size={12} strokeWidth={2.5}/> : item.units_in_stock <= 2 ? <AlertTriangle size={12} strokeWidth={2.5}/> : <CheckCircle size={12} strokeWidth={2.5}/>} {item.units_in_stock}
                        </span>
                      </td>
                      <td className={s.amountCost}>{fmt(item.total_invested)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
