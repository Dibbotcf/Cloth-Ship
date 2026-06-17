'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminStyles from '../../admin.module.css';
import s from '../ledger.module.css';
import { TrendingUp, DollarSign, Trophy, CreditCard, Plus, Check, Trash2, XCircle, CheckCircle2, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];

const STATUS_CLS = { paid: s.badgePaid, due: s.badgeDue, partial: s.badgePartial };
const STATUS_LABEL = { paid: <><CheckCircle size={12} strokeWidth={2.5}/> Paid</>, due: <><XCircle size={12} strokeWidth={2.5}/> Due</>, partial: <><HelpCircle size={12} strokeWidth={2.5}/> Partial</> };

export default function SalesPage() {
  const [sales, setSales]           = useState([]);
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [stockAlert, setStockAlert] = useState(null);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    item_id: '', sale_date: today(), customer: '',
    quantity: '', unit_price: '', payment_status: 'paid', note: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, iRes] = await Promise.all([
        fetch('/api/admin/ledger/sales'),
        fetch('/api/admin/ledger/items'),
      ]);
      const [sData, iData] = await Promise.all([sRes.json(), iRes.json()]);
      if (!sRes.ok) throw new Error(sData.error);
      setSales(Array.isArray(sData) ? sData : []);
      setItems(Array.isArray(iData) ? iData : []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Live stock check when item or quantity changes
    if (name === 'item_id' || name === 'quantity') {
      const itemId  = name === 'item_id' ? value : form.item_id;
      const qty     = parseInt(name === 'quantity' ? value : form.quantity) || 0;
      const item    = items.find(i => String(i.id) === String(itemId));
      if (item && qty > 0) {
        if (qty > item.units_in_stock) {
          setStockAlert({ type: 'error', msg: `⛔ Only ${item.units_in_stock} in stock — can't sell ${qty}` });
        } else if (item.units_in_stock - qty <= 1) {
          setStockAlert({ type: 'warn', msg: `⚠️ Low stock! Only ${item.units_in_stock - qty} will remain after this sale.` });
        } else {
          setStockAlert(null);
        }
      } else {
        setStockAlert(null);
      }
    }
  };

  const selectedItem    = items.find(i => String(i.id) === String(form.item_id));
  const totalPreview    = form.quantity && form.unit_price
    ? (parseFloat(form.quantity) * parseFloat(form.unit_price)).toFixed(2) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_id) { showToast('Please select an item.', 'error'); return; }
    if (stockAlert?.type === 'error') { showToast('Cannot sell — insufficient stock.', 'error'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/ledger/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: parseInt(form.quantity), unit_price: parseFloat(form.unit_price) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Sale recorded! Revenue: ${fmt(data.total_amount)} · Profit: ${fmt(data.profit)}`);
      setForm({ item_id: '', sale_date: today(), customer: '', quantity: '', unit_price: '', payment_status: 'paid', note: '' });
      setStockAlert(null);
      setFormOpen(false);
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale? KPIs will recalculate.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/ledger/sales/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Sale deleted.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally     { setDeletingId(null); }
  };

  const totalRevenue  = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalCOGS     = sales.reduce((sum, s) => sum + Number(s.cost_of_goods), 0);
  const totalProfit   = totalRevenue - totalCOGS;
  const dueCount      = sales.filter(s => s.payment_status === 'due' || s.payment_status === 'partial').length;

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
          <h1 className={adminStyles.pageTitle}>Sales</h1>
        </div>
        <Link href="/admin/ledger" className={adminStyles.backLink}>← Ledger Dashboard</Link>
      </div>

      {/* Summary KPIs */}
      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className={`${s.kpiCard} ${s.revenue}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Revenue</span>
              <span className={s.kpiValue}>{fmt(totalRevenue)}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.revenue}`}><TrendingUp size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
        <div className={`${s.kpiCard} ${s.stock}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Cost of Goods</span>
              <span className={s.kpiValue}>{fmt(totalCOGS)}</span>
            </div>
            <div className={`${s.kpiIcon} ${s.stock}`}><DollarSign size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
        <div className={`${s.kpiCard} ${s.profit}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Net Profit</span>
              <span className={`${s.kpiValue} ${totalProfit >= 0 ? s.profitPositive : s.profitNegative}`}>
                {fmt(totalProfit)}
              </span>
            </div>
            <div className={`${s.kpiIcon} ${s.profit}`}><Trophy size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
        <div className={`${s.kpiCard} ${dueCount > 0 ? s.stockval : s.cash}`}>
          <div className={s.kpiCardInner}>
            <div className={s.kpiInfo}>
              <span className={s.kpiLabel}>Unpaid Orders</span>
              <span className={s.kpiValue} style={{ fontSize: '1.7rem' }}>{dueCount}</span>
            </div>
            <div className={`${s.kpiIcon} ${dueCount > 0 ? s.stockval : s.cash}`}><CreditCard size={24} strokeWidth={1.5} /></div>
          </div>
        </div>
      </div>

      {/* Sale Form */}
      <div className={s.formPanel} style={{ marginBottom: 24 }}>
        <div className={s.formPanelHeader} onClick={() => setFormOpen(o => !o)}>
          <span className={s.formPanelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={18} strokeWidth={2} /> Record a Sale
          </span>
          <span className={`${s.formPanelToggle} ${formOpen ? s.open : ''}`}>+</span>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className={s.formPanelBody}>
            {items.length === 0 && (
              <div className={s.stockWarning}>
                ⚠️ No items in catalog. <Link href="/admin/ledger/purchases" style={{ color: 'inherit', textDecoration: 'underline' }}>Go to Purchases</Link> to add items first.
              </div>
            )}

            <div className={`${s.formRow} ${s.cols2}`}>
              <div className={s.formField}>
                <label className={s.formLabel}>Item <span className={s.formRequired}>*</span></label>
                <select name="item_id" value={form.item_id} onChange={handleChange} className={s.formSelect} required>
                  <option value="">— Select item —</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id} disabled={i.units_in_stock <= 0}>
                      {i.name} — Stock: {i.units_in_stock} {i.unit}{i.units_in_stock <= 0 ? ' (Out of stock)' : ''}
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span className={s.formHint}>Available: </span>
                    <span className={`${s.stockPill} ${selectedItem.units_in_stock > 2 ? s.stockPillOk : selectedItem.units_in_stock > 0 ? s.stockPillLow : s.stockPillOut}`}>
                      {selectedItem.units_in_stock} in stock
                    </span>
                  </div>
                )}
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Sale Date <span className={s.formRequired}>*</span></label>
                <input type="date" name="sale_date" value={form.sale_date} onChange={handleChange} className={s.formInput} required />
              </div>
            </div>

            <div className={`${s.formRow} ${s.cols4}`}>
              <div className={s.formField}>
                <label className={s.formLabel}>Quantity <span className={s.formRequired}>*</span></label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={s.formInput} placeholder="5" min="1" required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Selling Price (৳) <span className={s.formRequired}>*</span></label>
                <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange} className={s.formInput} placeholder="2000" min="0.01" step="0.01" required />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Total Amount</label>
                <div style={{ padding: '10px 13px', borderRadius: 9, background: '#faf9f7', border: '1.5px solid #e8e0d8', fontWeight: 700, color: '#7c3aed', fontSize: 14 }}>
                  {totalPreview ? fmt(totalPreview) : '—'}
                </div>
                <span className={s.formHint}>Auto-computed</span>
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Payment Status</label>
                <select name="payment_status" value={form.payment_status} onChange={handleChange} className={s.formSelect}>
                  <option value="paid">✅ Paid</option>
                  <option value="due">❌ Due</option>
                  <option value="partial">⚠️ Partial</option>
                </select>
              </div>
            </div>

            <div className={`${s.formRow} ${s.cols2}`}>
              <div className={s.formField}>
                <label className={s.formLabel}>Customer Name</label>
                <input type="text" name="customer" value={form.customer} onChange={handleChange} className={s.formInput} placeholder="Customer / buyer name" />
              </div>
              <div className={s.formField}>
                <label className={s.formLabel}>Note (optional)</label>
                <input type="text" name="note" value={form.note} onChange={handleChange} className={s.formInput} placeholder="Any additional note" />
              </div>
            </div>

            {/* Stock Alert */}
            {stockAlert && (
              <div className={stockAlert.type === 'error' ? s.stockError : s.stockWarning}>
                {stockAlert.msg}
              </div>
            )}

            <div className={s.formActions}>
              <button type="submit" disabled={submitting || stockAlert?.type === 'error'} className={adminStyles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {submitting ? '⏳ Saving…' : <><Check size={16} strokeWidth={2.5} /> Record Sale</>}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className={adminStyles.secondaryBtn}>Cancel</button>
              {stockAlert?.type === 'error' && (
                <span style={{ fontSize: 12.5, color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={14} strokeWidth={2.5} /> Sale blocked — insufficient stock
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Sales Table */}
      <div className={s.tableCard}>
        <div className={s.tableCardHeader}>
          <span className={s.tableCardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={18} strokeWidth={2} /> Sales History
          </span>
          <span className={s.tableCount}>{sales.length} records</span>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                {[...Array(7)].map((__, j) => (
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
        ) : sales.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon} style={{ background: 'none', border: 'none', width: 'auto', height: 'auto', marginBottom: 12 }}>
              <TrendingUp size={48} strokeWidth={1} color="#d4ccbc" />
            </div>
            <div className={s.emptyTitle}>No sales recorded yet</div>
            <div className={s.emptySub}>Record purchases first, then come back to log your sales.</div>
          </div>
        ) : (
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Revenue</th>
                  <th>COGS</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, idx) => {
                  const profit = Number(sale.total_amount) - Number(sale.cost_of_goods);
                  return (
                    <tr key={sale.id}>
                      <td style={{ color: '#b0a8a0', fontSize: 12 }}>{sales.length - idx}</td>
                      <td style={{ color: '#7a7a7a', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {new Date(sale.sale_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td><strong style={{ color: '#1a1209', fontSize: 13 }}>{sale.item_name}</strong></td>
                      <td style={{ color: '#7a7a7a', fontSize: 12 }}>{sale.customer || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{sale.quantity}</td>
                      <td style={{ color: '#5a5a5a' }}>{fmt(sale.unit_price)}</td>
                      <td className={s.amountCell}>{fmt(sale.total_amount)}</td>
                      <td className={s.amountCost}>{fmt(sale.cost_of_goods)}</td>
                      <td className={profit >= 0 ? s.amountProfit : s.amountWithdraw} style={{ fontWeight: 700 }}>
                        {profit >= 0 ? '' : '−'}{fmt(Math.abs(profit))}
                      </td>
                      <td>
                        <span className={`${s.badge} ${STATUS_CLS[sale.payment_status] || s.badgePaid}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {STATUS_LABEL[sale.payment_status] || sale.payment_status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          disabled={deletingId === sale.id}
                          className={s.deleteBtn}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {deletingId === sale.id ? '⏳' : <Trash2 size={14} strokeWidth={2} />} Delete
                        </button>
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
  );
}
