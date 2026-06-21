'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('clothship_cart') || '[]');
        setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0));
      } catch { setCartCount(0); }
    };
    updateCart();
    window.addEventListener('cart-updated', updateCart);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('cart-updated', updateCart); };
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} id="site-header">
        <div className={styles.headerInner}>
          {/* Mobile menu toggle */}
          <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" id="mobile-menu-toggle">
            <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.open : ''}`} />
            <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.open : ''}`} />
            <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.open : ''}`} />
          </button>

          {/* Nav Left */}
          <nav className={styles.navLeft}>
            <Link href="/shop?gender=women" className={styles.navLink}>Women</Link>
            <Link href="/shop?gender=men" className={styles.navLink}>Men</Link>
            <Link href="/shop?collection=spring-voyage" className={styles.navLink}>Collections</Link>
          </nav>

          {/* Logo */}
          <Link href="/" className={styles.logo} id="site-logo">
            <img src="/images/brand/logo.jpeg" alt="Cloth Ship" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.logoName}>Cloth Ship</span>
            </div>
          </Link>

          {/* Nav Right */}
          <div className={styles.navRight}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" id="search-toggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist" id="wishlist-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </Link>
            <Link href="/cart" className={styles.cartBtn} aria-label="Cart" id="cart-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className={styles.searchOverlay}>
            <div className={styles.searchInner}>
              <input type="text" placeholder="Search for sarees, panjabis, kurtas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.searchInput} autoFocus id="search-input" />
              <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>✕</button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileOpen && <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />}
      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerHeader}>
          <span className={styles.logoName}>Cloth Ship</span>
          <button onClick={() => setMobileOpen(false)} className={styles.mobileClose}>✕</button>
        </div>
        <nav className={styles.mobileNav}>
          <Link href="/shop?gender=women" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Women</Link>
          <Link href="/shop?gender=men" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Men</Link>
          <Link href="/shop?collection=spring-voyage" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Collections</Link>
          <Link href="/about" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>About Us</Link>
          <Link href="/contact" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Contact Us</Link>
        </nav>
      </div>
    </>
  );
}
