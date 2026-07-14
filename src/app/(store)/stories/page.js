'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './stories.module.css';

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? styles.starOn : styles.starOff}>★</span>
      ))}
    </div>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((d) => setStories(Array.isArray(d) ? d : []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> / <span>Stories</span>
      </div>

      <div className={styles.header}>
        <span className={styles.label}>From Our Community</span>
        <h1 className={styles.title}>Stories &amp; Reviews</h1>
        <p className={styles.desc}>Real experiences from the people who wear Cloth Ship.</p>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading stories…</p>
      ) : stories.length === 0 ? (
        <div className={styles.empty}>
          <h3>No stories yet</h3>
          <p>Check back soon — customer stories and reviews will appear here.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {stories.map((s) => (
            <article key={s.id} className={styles.card}>
              {s.image && (
                <div className={styles.cardImageWrap}>
                  <img src={s.image} alt={s.title} className={styles.cardImage} loading="lazy" decoding="async" />
                </div>
              )}
              <div className={styles.cardBody}>
                <Stars rating={s.rating} />
                <span className={styles.quoteMark} aria-hidden="true">“</span>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardContent}>{s.content}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.author}>{s.author || 'Cloth Ship Customer'}</span>
                  {s.location && <span className={styles.metaSub}>· {s.location}</span>}
                  {s.created_at && <span className={styles.metaSub}>· {fmt(s.created_at)}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
