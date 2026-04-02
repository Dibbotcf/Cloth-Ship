'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // If it's the login page, don't show the dashboard layout
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

  // Don't wrap the login page in the dashboard layout
  if (pathname === '/admin/login') return children;

  const handleLogout = () => {
    localStorage.removeItem('clothship_admin_auth');
    router.push('/admin/login');
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin">
            <h2>Cloth Ship</h2>
            <span>CMS Panel</span>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`}>
            Dashboard
          </Link>
          <Link href="/admin/products" className={`${styles.navLink} ${pathname.startsWith('/admin/products') ? styles.active : ''}`}>
            Products
          </Link>
          <Link href="/admin/orders" className={`${styles.navLink} ${pathname.startsWith('/admin/orders') ? styles.active : ''}`}>
            Orders
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          <Link href="/" target="_blank" className={styles.viewSiteBtn}>View Site ↗</Link>
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
