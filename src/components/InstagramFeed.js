import styles from './InstagramFeed.module.css';

const posts = [
  { id: 1, image: '/images/products/saree-red.png' },
  { id: 2, image: '/images/categories/men.png' },
  { id: 3, image: '/images/products/kurta-blue.png' },
  { id: 4, image: '/images/brand/story.png' },
  { id: 5, image: '/images/products/salwar-green.png' },
  { id: 6, image: '/images/products/waistcoat-maroon.png' },
];

export default function InstagramFeed() {
  return (
    <section className={styles.section} id="instagram-feed">
      <div className={styles.header}>
        <span className={styles.label}>Follow Us</span>
        <h2 className={styles.title}>@clothship</h2>
        <p className={styles.desc}>Join our community and share your Cloth Ship moments</p>
      </div>
      <div className={styles.grid}>
        {posts.map(post => (
          <a key={post.id} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.post}>
            <img src={post.image} alt="Instagram post" className={styles.postImage} />
            <div className={styles.postOverlay}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="white" strokeWidth="2"/></svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
