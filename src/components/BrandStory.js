import styles from './BrandStory.module.css';

export default function BrandStory() {
  return (
    <section className={styles.section} id="brand-story">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              <img src="/images/brand/story.png" alt="The art of weaving at Cloth Ship" className={styles.image} />
              <div className={styles.imageAccent} />
            </div>
          </div>
          <div className={styles.contentCol}>
            <span className={styles.label}>Our Heritage</span>
            <h2 className={styles.title}>The Cloth Ship Story</h2>
            <div className={styles.divider} />
            <p className={styles.text}>
              Born from the confluence of maritime adventure and textile heritage, Cloth Ship represents a voyage through time — where ancient weaving traditions meet contemporary design sensibilities.
            </p>
            <p className={styles.text}>
              Our name pays homage to the historic trade ships that carried precious textiles across the Bay of Bengal, connecting cultures through the universal language of fabric and craft.
            </p>
            <p className={styles.text}>
              Every piece in our collection is a testament to the skill of master artisans who have preserved their craft through generations. We work directly with weavers and embroiderers across Bangladesh, ensuring each creation carries the authenticity of true craftsmanship.
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Artisan Partners</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Unique Fabrics</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10K+</span>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
