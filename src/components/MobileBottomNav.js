'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
        setCartCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
      } catch { setCartCount(0); }
    };
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  // Product detail pages have their own sticky Add-to-Cart bar — don't stack a nav under it.
  if (pathname && pathname.startsWith('/product/')) return null;

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname && pathname.startsWith(href));

  const items = [
    { href: '/', label: 'Home', icon: (<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>) },
    { href: '/shop', label: 'Shop', icon: (<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>) },
    { href: '/wishlist', label: 'Wishlist', icon: (<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />) },
    { href: '/cart', label: 'Cart', badge: cartCount, icon: (<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>) },
  ];

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Primary">
        {items.map(({ href, label, icon, badge }) => (
          <Link key={href} href={href} className={`${styles.item} ${isActive(href) ? styles.active : ''}`}>
            <span className={styles.iconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              {badge > 0 && <span className={styles.badge}>{badge > 99 ? '99+' : badge}</span>}
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
