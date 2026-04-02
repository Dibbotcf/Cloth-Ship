import styles from './about.module.css';

export const metadata = {
  title: 'About Us — Cloth Ship',
  description: 'Learn about Cloth Ship\'s journey of blending maritime heritage with traditional textiles.',
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Our Story</span>
          <h1 className={styles.heroTitle}>Tradition with a Modern Twist</h1>
          <p className={styles.heroDesc}>For generations, Cloth Ship has been weaving the rich textile heritage of Bangladesh into contemporary fashion statements.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div>
              <img src="/images/brand/story.png" alt="Our heritage" className={styles.storyImage} />
            </div>
            <div className={styles.storyContent}>
              <h2>The Maritime Heritage</h2>
              <p>Our name pays homage to the historic trade ships that carried precious textiles across the Bay of Bengal. These vessels connected cultures through the universal language of fabric and craft, creating a rich tapestry of shared traditions.</p>
              <p>Today, Cloth Ship continues this voyage — bridging the ancient art of handloom weaving with contemporary design sensibilities. Every piece we create carries within it the spirit of those historic journeys.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            {[
              { icon: '🧵', title: 'Artisan Craftsmanship', desc: 'We work directly with 500+ master artisans, preserving centuries-old techniques.' },
              { icon: '🌿', title: 'Sustainable Practices', desc: 'Natural dyes, organic fabrics, and ethical production at every step.' },
              { icon: '✨', title: 'Modern Design', desc: 'Traditional silhouettes reimagined for the contemporary wardrobe.' },
              { icon: '🤝', title: 'Fair Trade', desc: 'Fair wages and safe working conditions for every artisan in our network.' },
            ].map(v => (
              <div key={v.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Get in Touch</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h4>Phone</h4>
              <a href="tel:+8801343895708">+880 1343 895708</a>
            </div>
            <div className={styles.contactCard}>
              <h4>Email</h4>
              <a href="mailto:info.clothship@gmail.com">info.clothship@gmail.com</a>
            </div>
            <div className={styles.contactCard}>
              <h4>Location</h4>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
