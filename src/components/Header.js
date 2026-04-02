'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const menuItems = {
  Women: {
    categories: [
      { name: 'Sarees', href: '/shop?category=sarees', desc: 'Handwoven elegance' },
      { name: 'Salwar Kameez', href: '/shop?category=salwar-kameez', desc: 'Timeless comfort' },
      { name: 'Kurtas', href: '/shop?category=kurtas-women', desc: 'Everyday grace' },
      { name: 'Fusion Wear', href: '/shop?category=fusion-wear', desc: 'Modern tradition' },
    ],
  },
  Men: {
    categories: [
      { name: 'Panjabis', href: '/shop?category=panjabis', desc: 'Classic refinement' },
      { name: 'Fatua', href: '/shop?category=fatua', desc: 'Casual heritage' },
      { name: 'Waistcoats', href: '/shop?category=waistcoats', desc: 'Dapper details' },
    ],
  },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [megaMenu, setMegaMenu] = useState(null);
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
            {Object.keys(menuItems).map(key => (
              <div key={key} className={styles.navItem} onMouseEnter={() => setMegaMenu(key)} onMouseLeave={() => setMegaMenu(null)}>
                <button className={styles.navLink}>{key}</button>
                {megaMenu === key && (
                  <div className={styles.megaMenu}>
                    <div className={styles.megaMenuInner}>
                      <div className={styles.megaMenuCategories}>
                        <h4 className={styles.megaMenuTitle}>{key}&apos;s Collection</h4>
                        {menuItems[key].categories.map(cat => (
                          <Link key={cat.name} href={cat.href} className={styles.megaMenuLink} onClick={() => setMegaMenu(null)}>
                            <span className={styles.megaMenuLinkName}>{cat.name}</span>
                            <span className={styles.megaMenuLinkDesc}>{cat.desc}</span>
                          </Link>
                        ))}
                      </div>
                      <div className={styles.megaMenuImage}>
                        <img src={key === 'Women' ? '/images/categories/women.png' : '/images/categories/men.png'} alt={`${key}'s collection`} />
                        <Link href={`/shop?gender=${key.toLowerCase()}`} className={styles.megaMenuShopAll}>
                          Shop All {key}&apos;s →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link href="/shop?collection=spring-voyage" className={styles.navLink}>Collections</Link>
          </nav>

          {/* Logo */}
          <Link href="/" className={styles.logo} id="site-logo">
            <img src="/images/brand/logo.png" alt="Cloth Ship" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.logoName}>Cloth Ship</span>
            </div>
          </Link>

          {/* Nav Right */}
          <div className={styles.navRight}>
            <Link href="/about" className={styles.navLink}>About</Link>
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
          {Object.keys(menuItems).map(key => (
            <div key={key} className={styles.mobileNavGroup}>
              <h4 className={styles.mobileNavTitle}>{key}</h4>
              {menuItems[key].categories.map(cat => (
                <Link key={cat.name} href={cat.href} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>{cat.name}</Link>
              ))}
            </div>
          ))}
          <Link href="/shop?collection=spring-voyage" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Collections</Link>
          <Link href="/about" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>About Us</Link>
        </nav>
      </div>
    </>
  );
}
