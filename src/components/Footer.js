'use client';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.footerTop}>
        <div className={styles.container}>
          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h3 className={styles.newsletterTitle}>Join the Voyage</h3>
            <p className={styles.newsletterDesc}>Subscribe for exclusive collections, early access, and styling inspiration.</p>
            <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className={styles.newsletterInput} id="newsletter-email" />
              <button type="submit" className={styles.newsletterBtn} id="newsletter-submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.footerMain}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerBrand}>Cloth Ship</h4>
              <p className={styles.footerTagline}>Tradition with a Modern Twist</p>
              <p className={styles.footerAbout}>Weaving heritage into every thread, Cloth Ship brings you premium traditional clothing for the modern wardrobe.</p>
              <div className={styles.socialLinks}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.footerCol}>
              <h5 className={styles.footerColTitle}>Quick Links</h5>
              <Link href="/shop?gender=women" className={styles.footerLink}>Women</Link>
              <Link href="/shop?gender=men" className={styles.footerLink}>Men</Link>
              <Link href="/shop?collection=spring-voyage" className={styles.footerLink}>Collections</Link>
              <Link href="/about" className={styles.footerLink}>About Us</Link>
            </div>

            {/* Customer Service */}
            <div className={styles.footerCol}>
              <h5 className={styles.footerColTitle}>Customer Service</h5>
              <Link href="/shipping" className={styles.footerLink}>Shipping & Delivery</Link>
              <Link href="/returns" className={styles.footerLink}>Returns & Exchange</Link>
              <Link href="/faq" className={styles.footerLink}>FAQ</Link>
              <Link href="/size-guide" className={styles.footerLink}>Size Guide</Link>
            </div>

            {/* Contact */}
            <div className={styles.footerCol}>
              <h5 className={styles.footerColTitle}>Contact Us</h5>
              <a href="tel:+8801343895708" className={styles.footerLink}>+880 1343 895708</a>
              <a href="mailto:info.clothship@gmail.com" className={styles.footerLink}>info.clothship@gmail.com</a>
              <p className={styles.footerAddress}>Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.container}>
          <p>© {new Date().getFullYear()} Cloth Ship. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
