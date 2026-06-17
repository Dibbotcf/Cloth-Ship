'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminStyles from '../admin.module.css';
import s from './ledger.module.css';

import { 
  Banknote, ShoppingBag, Wallet, TrendingUp, Trophy, PackageOpen 
} from 'lucide-react';

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const KPI_CONFIG = [
  { key: 'total_capital',         icon: <Banknote size={24} strokeWidth={1.5} />, label: 'Total Capital',         cls: 'capital'  },
  { key: 'total_stock_investment',icon: <ShoppingBag size={24} strokeWidth={1.5} />, label: 'Stock Investment',      cls: 'stock'    },
  { key: 'remaining_cash',        icon: <Wallet size={24} strokeWidth={1.5} />, label: 'Remaining Cash',        cls: 'cash'     },
  { key: 'total_sales_revenue',   icon: <TrendingUp size={24} strokeWidth={1.5} />, label: 'Total Sales Revenue',   cls: 'revenue'  },
  { key: 'net_profit',            icon: <Trophy size={24} strokeWidth={1.5} />, label: 'Net Profit',            cls: 'profit'   },
  { key: 'stock_value_remaining', icon: <PackageOpen size={24} strokeWidth={1.5} />, label: 'Stock Value Remaining', cls: 'stockval' },
];

export default function LedgerDashboard() {
  const [kpis, setKpis]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/admin/ledger/dashboard')
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(data.error); setKpis(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className={adminStyles.pageHeader}>
        <div className={adminStyles.pageTitleGroup}>
          <span className={adminStyles.pageLabel}>Accounting</span>
          <h1 className={adminStyles.pageTitle}>Ledger</h1>
        </div>
        <span style={{ fontSize: 12, color: '#9a9a9a', fontWeight: 600 }}>
          {kpis && `Currency: BDT ৳`}
        </span>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className={s.kpiGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={s.kpiCard}>
              <div className={s.skeleton} style={{ height: 13, width: '55%', marginBottom: 8 }} />
              <div className={s.skeleton} style={{ height: 32, width: '70%' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={adminStyles.errorBox} style={{ marginBottom: 24 }}>
          <span className={adminStyles.errorIcon}>⚠️</span>
          <div>
            <div className={adminStyles.errorTitle}>Database Error</div>
            <div className={adminStyles.errorMessage}>{error}</div>
          </div>
        </div>
      ) : (
        <div className={s.kpiGrid}>
          {KPI_CONFIG.map(cfg => {
            const value = kpis?.[cfg.key] ?? 0;
            const isProfit = cfg.key === 'net_profit';
            return (
              <div key={cfg.key} className={`${s.kpiCard} ${s[cfg.cls]}`}>
                <div className={s.kpiCardInner}>
                  <div className={s.kpiInfo}>
                    <span className={s.kpiLabel}>{cfg.label}</span>
                    <span className={`${s.kpiValue} ${isProfit ? (value >= 0 ? s.profitPositive : s.profitNegative) : ''}`}>
                      {fmt(value)}
                    </span>
                  </div>
                  <div className={`${s.kpiIcon} ${s[cfg.cls]}`}>{cfg.icon}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Navigation */}
      <div className={s.quickNav}>
        <Link href="/admin/ledger/capital" className={s.quickNavBtn}>
          <div className={s.quickNavIcon}><Banknote size={24} strokeWidth={1.5} /></div>
          <div className={s.quickNavText}>
            <span className={s.quickNavTitle}>Capital</span>
            <span className={s.quickNavSub}>Add or view capital entries</span>
          </div>
        </Link>
        <Link href="/admin/ledger/purchases" className={s.quickNavBtn}>
          <div className={s.quickNavIcon}><ShoppingBag size={24} strokeWidth={1.5} /></div>
          <div className={s.quickNavText}>
            <span className={s.quickNavTitle}>Purchases</span>
            <span className={s.quickNavSub}>Record stock purchases</span>
          </div>
        </Link>
        <Link href="/admin/ledger/sales" className={s.quickNavBtn}>
          <div className={s.quickNavIcon}><TrendingUp size={24} strokeWidth={1.5} /></div>
          <div className={s.quickNavText}>
            <span className={s.quickNavTitle}>Sales</span>
            <span className={s.quickNavSub}>Record sales & track profit</span>
          </div>
        </Link>
      </div>

      {/* Formula reference card */}
      <div className={adminStyles.activityCard}>
        <div className={adminStyles.cardHeader}>
          <span className={adminStyles.cardTitle}>📐 How KPIs Are Calculated</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: 13, color: '#5a5a5a', lineHeight: 1.8 }}>
          <div>
            <strong style={{ color: '#1a1209' }}>Remaining Cash</strong><br />
            <code style={{ fontSize: 12, background: '#faf5f0', padding: '2px 6px', borderRadius: 4 }}>Capital − Purchases + Sales</code>
          </div>
          <div>
            <strong style={{ color: '#1a1209' }}>Net Profit</strong><br />
            <code style={{ fontSize: 12, background: '#faf5f0', padding: '2px 6px', borderRadius: 4 }}>Sales Revenue − Cost of Goods</code>
          </div>
          <div>
            <strong style={{ color: '#1a1209' }}>Stock Value</strong><br />
            <code style={{ fontSize: 12, background: '#faf5f0', padding: '2px 6px', borderRadius: 4 }}>Total Purchases − Cost of Goods Sold</code>
          </div>
          <div>
            <strong style={{ color: '#1a1209' }}>Profit Method</strong><br />
            <span style={{ fontSize: 12, color: '#9a9a9a' }}>Weighted average cost per item</span>
          </div>
        </div>
      </div>
    </div>
  );
}
