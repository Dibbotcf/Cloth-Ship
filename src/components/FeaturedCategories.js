import Link from 'next/link';
import styles from './FeaturedCategories.module.css';

export default function FeaturedCategories() {
  return (
    <section className={styles.section} id="featured-categories">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Explore</span>
          <h2 className={styles.title}>Shop by Category</h2>
        </div>
        <div className={styles.grid}>
          <Link href="/shop?gender=women" className={styles.card} id="category-women">
            <div className={styles.cardImage}>
              <img src="/images/categories/women.png" alt="Women's Collection" />
              <div className={styles.cardOverlay} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Women&apos;s Collection</h3>
              <p className={styles.cardDesc}>Sarees, Kurtas, Salwar Kameez & More</p>
              <span className={styles.cardCta}>Explore →</span>
            </div>
          </Link>
          <Link href="/shop?gender=men" className={styles.card} id="category-men">
            <div className={styles.cardImage}>
              <img src="/images/categories/men.png" alt="Men's Collection" />
              <div className={styles.cardOverlay} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Men&apos;s Collection</h3>
              <p className={styles.cardDesc}>Panjabis, Fatua, Waistcoats & More</p>
              <span className={styles.cardCta}>Explore →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
