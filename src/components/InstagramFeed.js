import styles from './InstagramFeed.module.css';

const posts = [
  { id: 1, image: '/images/products/saree-red.png' },
  { id: 2, image: '/images/categories/men.png' },
  { id: 3, image: '/images/products/kurta-blue.png' },
  { id: 4, image: '/images/brand/story.png' },
  { id: 5, image: '/images/products/salwar-green.png' },
  { id: 6, image: '/images/products/waistcoat-maroon.png' },
];

const FB_URL = 'https://www.facebook.com/share/1NgmhG5XYE/';

export default function InstagramFeed() {
  return (
    <section className={styles.section} id="facebook-feed">
      <div className={styles.header}>
        <span className={styles.label}>Follow Us</span>
        <h2 className={styles.title}>Cloth Ship on Facebook</h2>
        <p className={styles.desc}>Join our community and share your Cloth Ship moments</p>
      </div>
      <div className={styles.grid}>
        {posts.map(post => (
          <a key={post.id} href={FB_URL} target="_blank" rel="noopener noreferrer" className={styles.post}>
            <img src={post.image} alt="Cloth Ship Facebook" className={styles.postImage} />
            <div className={styles.postOverlay}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
