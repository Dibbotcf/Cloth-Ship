'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

import { 
  LayoutDashboard, Shirt, Package, BookOpen, 
  Banknote, ShoppingBag, TrendingUp, Anchor, LogOut, FolderTree
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    const auth = localStorage.getItem('clothship_admin_auth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized) return null;
  if (pathname === '/admin/login') return children;

  const handleLogout = () => {
    localStorage.removeItem('clothship_admin_auth');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard', exact: true },
    { href: '/admin/products', icon: <Shirt size={18} strokeWidth={1.5} />, label: 'Products', exact: false },
    { href: '/admin/categories', icon: <FolderTree size={18} strokeWidth={1.5} />, label: 'Categories', exact: false },
    { href: '/admin/orders', icon: <Package size={18} strokeWidth={1.5} />, label: 'Orders', exact: false },
  ];

  const ledgerNavItems = [
    { href: '/admin/ledger', icon: <BookOpen size={18} strokeWidth={1.5} />, label: 'Ledger', exact: true },
    { href: '/admin/ledger/capital', icon: <Banknote size={16} strokeWidth={1.5} />, label: 'Capital', exact: false },
    { href: '/admin/ledger/purchases', icon: <ShoppingBag size={16} strokeWidth={1.5} />, label: 'Purchases', exact: false },
    { href: '/admin/ledger/sales', icon: <TrendingUp size={16} strokeWidth={1.5} />, label: 'Sales', exact: false },
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin">
            <div className={styles.sidebarLogo}>
              <div className={styles.sidebarLogoIcon}>
                <img src="/images/brand/logo.jpeg" alt="CS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
              <h2>Cloth Ship</h2>
            </div>
            <span>CMS Panel</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Main Menu</div>
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <div className={styles.navSection} style={{ marginTop: 8 }}>Accounting</div>
          {ledgerNavItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const isSubItem = item.href !== '/admin/ledger';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                style={isSubItem ? { paddingLeft: 28, fontSize: 13 } : {}}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>


        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} strokeWidth={2} style={{ marginRight: 6 }} /> Logout
          </button>
          <Link href="/" target="_blank" className={styles.viewSiteBtn}>
            View Site ↗
          </Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
