'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Banknote, FileText, Plus, Check, Download, Upload, Trash2, XCircle, CheckCircle2, Pencil, X } from 'lucide-react';
import adminStyles from '../../admin.module.css';
import s from '../ledger.module.css';

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];

export default function CapitalPage() {
  const [entries, setEntries]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]       = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState(null);

  const [form, setForm] = useState({
    entry_date: today(), amount: '', note: '', type: 'invest'
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ledger/capital');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditChange = e => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditForm({
      entry_date: e.entry_date ? e.entry_date.split('T')[0] : today(),
      amount: String(Math.abs(Number(e.amount))),
      note: e.note || '',
      type: Number(e.amount) >= 0 ? 'invest' : 'withdraw',
    });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm(null); };

  const handleEditSubmit = async (id) => {
    if (!editForm.amount || parseFloat(editForm.amount) === 0) {
      showToast('Amount cannot be zero.', 'error'); return;
    }
    setSubmitting(true);
    const finalAmount = editForm.type === 'withdraw'
      ? -Math.abs(parseFloat(editForm.amount))
      :  Math.abs(parseFloat(editForm.amount));
    try {
      const res = await fetch(`/api/admin/ledger/capital/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_date: editForm.entry_date, amount: finalAmount, note: editForm.note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Capital entry updated.');
      cancelEdit();
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) === 0) {
      showToast('Amount cannot be zero.', 'error'); return;
    }
    setSubmitting(true);
    const finalAmount = form.type === 'withdraw'
      ? -Math.abs(parseFloat(form.amount))
      :  Math.abs(parseFloat(form.amount));
    try {
      const res = await fetch('/api/admin/ledger/capital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_date: form.entry_date, amount: finalAmount, note: form.note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(form.type === 'withdraw' ? 'Withdrawal recorded.' : 'Capital added successfully.');
      setForm({ entry_date: today(), amount: '', note: '', type: 'invest' });
      setFormOpen(false);
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this capital entry?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/ledger/capital/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Entry deleted.');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setDeletingId(null); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`${s.toast} ${toast.type === 'error' ? s.toastError : s.toastSuccess}`}>
          <span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
            {toast.type === 'error' ? <XCircle size={18} strokeWidth={2} /> : <CheckCircle2 size={18} strokeWidth={2} />}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className={adminStyles.pageHeader}>
        <div className={adminStyles.pageTitleGroup}>
          <span className={adminStyles.pageLabel}>Accounting</span>
          <h1 className={adminStyles.pageTitle}>Capital</h1>
        </div>
        <Link href="/admin/ledger" className={adminStyles.backLink}>← Ledger Dashboard</Link>
      </div>

      {/* Summary Card */}
      <div className={s.kpiGrid} style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div className={`${s.kpiCard} ${s.capital}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Total Capital</span>
              <span className={s.kpiValue}>{fmt(total)}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.capital}`}><Banknote size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
        <div className={`${s.kpiCard} ${s.cash}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Total Entries</span>
              <span className={s.kpiValue} style={{ fontSize: '1.7rem' }}>{entries.length}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.cash}`}><FileText size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <div className={s.formPanel} style={{ marginBottom: 24 }}>
        <div
          className={s.formPanelHeader}
          onClick={() => setFormOpen(o => !o)}
        >
          <span className={s.formPanelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={18} strokeWidth={2} /> Add Capital Entry
          </span>
          <span className={`${s.formPanelToggle} ${formOpen ? s.open : ''}`}>+</span>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className={s.formPanelBody}>
            {/* Type Toggle */}
            <div style={{ display: 'flex', gap: 12 }}>
              {['invest', 'withdraw'].map(t => (
                <label key={t} style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  padding: '10px 16px', borderRadius: 9,
                  border: `1.5px solid ${form.type === t ? (t === 'invest' ? '#16a34a' : '#dc2626') : '#e8e0d8'}`,
                  background: form.type === t ? (t === 'invest' ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.07)') : '#fff',
                  fontWeight: 600, fontSize: 13,
                  color: form.type === t ? (t === 'invest' ? '#15803d' : '#b91c1c') : '#6a6a6a',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio" name="type" value={t}
                    checked={form.type === t}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {t === 'invest' ? <><Download size={16} /> Invest / Add Capital</> : <><Upload size={16} /> Withdraw Capital</>}
                </label>
              ))}
            </div>

            <div className={`${s.formRow} ${s.cols3}`}>
              <div className={s.formField}>
                <label className={s.formLabel}>Date <span className={s.formRequired}>*</span></label>
                <input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} className={s.formInput} required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Amount (৳) <span className={s.formRequired}>*</span></label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} className={s.formInput} placeholder="41645" min="0.01" step="0.01" required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Note (optional)</label>
                <input type="text" name="note" value={form.note} onChange={handleChange} className={s.formInput} placeholder="e.g. Initial investment" />
              </div>
            </div>

            <div className={s.formActions}>
              <button type="submit" disabled={submitting} className={adminStyles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {submitting ? '⏳ Saving…' : <><Check size={16} strokeWidth={2.5} /> Save Entry</>}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className={adminStyles.secondaryBtn}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Table */}
      <div className={s.tableCard}>
        <div className={s.tableCardHeader}>
          <span className={s.tableCardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={18} strokeWidth={2} /> Capital Log
          </span>
          <span className={s.tableCount}>{entries.length} entries</span>
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <div className={s.skeleton} style={{ height: 13, width: 100 }} />
                <div className={s.skeleton} style={{ height: 13, flex: 1 }} />
                <div className={s.skeleton} style={{ height: 13, width: 80 }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={adminStyles.errorBox} style={{ margin: 20 }}>
            <span>⚠️</span>
            <div><div className={adminStyles.errorTitle}>Error</div><div className={adminStyles.errorMessage}>{error}</div></div>
          </div>
        ) : entries.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon} style={{ background: 'none', border: 'none', width: 'auto', height: 'auto', marginBottom: 12 }}>
              <Banknote size={48} strokeWidth={1} color="#d4ccbc" />
            </div>
            <div className={s.emptyTitle}>No capital entries yet</div>
            <div className={s.emptySub}>Add your first capital injection above.</div>
          </div>
        ) : (
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  editingId === e.id ? (
                    <tr key={e.id} style={{ background: '#fffbf5' }}>
                      <td style={{ color: '#b0a8a0', fontSize: 12 }}>{entries.length - idx}</td>
                      <td>
                        <input type="date" name="entry_date" value={editForm.entry_date} onChange={handleEditChange}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: '100%' }} />
                      </td>
                      <td>
                        <select name="type" value={editForm.type} onChange={handleEditChange}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12 }}>
                          <option value="invest">Invest</option>
                          <option value="withdraw">Withdraw</option>
                        </select>
                      </td>
                      <td>
                        <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} min="0.01" step="0.01"
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: 100 }} />
                      </td>
                      <td>
                        <input type="text" name="note" value={editForm.note} onChange={handleEditChange} placeholder="Note"
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e0dbd5', fontSize: 12, width: '100%' }} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleEditSubmit(e.id)} disabled={submitting}
                            style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {submitting ? '⏳' : <><Check size={13} /> Save</>}
                          </button>
                          <button onClick={cancelEdit}
                            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e0dbd5', background: '#fff', color: '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={e.id}>
                      <td style={{ color: '#b0a8a0', fontSize: 12 }}>{entries.length - idx}</td>
                      <td style={{ color: '#7a7a7a' }}>
                        {new Date(e.entry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        {Number(e.amount) >= 0
                          ? <span className={`${s.badge} ${s.badgePaid}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Download size={12} strokeWidth={2.5}/> Invest</span>
                          : <span className={`${s.badge} ${s.badgeDue}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Upload size={12} strokeWidth={2.5}/> Withdraw</span>}
                      </td>
                      <td className={Number(e.amount) >= 0 ? s.amountCell : s.amountWithdraw}>
                        {Number(e.amount) >= 0 ? fmt(e.amount) : `−${fmt(Math.abs(e.amount))}`}
                      </td>
                      <td style={{ color: '#7a7a7a', fontSize: 12 }}>{e.note || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(e)}
                            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d6c8bc', background: '#fff', color: '#6b4c2a', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id}
                            className={s.deleteBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {deletingId === e.id ? '⏳' : <Trash2 size={14} strokeWidth={2} />} Delete
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
    </div>
  );
}
