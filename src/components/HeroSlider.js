'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

const slides = [
  {
    image: '/images/hero/slide1.png',
    subtitle: 'New Collection 2026',
    title: 'Elegance Woven\nIn Tradition',
    cta: 'Shop Women',
    href: '/shop?gender=women',
  },
  {
    image: '/images/hero/slide2.png',
    subtitle: 'Heritage Menswear',
    title: 'The Modern\nGentleman',
    cta: 'Shop Men',
    href: '/shop?gender=men',
  },
  {
    image: '/images/hero/slide3.png',
    subtitle: 'Spring Voyage Collection',
    title: 'Crafted With\nPassion',
    cta: 'Explore Collection',
    href: '/shop?collection=spring-voyage',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((idx) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTimeout(() => setTransitioning(false), 100);
    }, 500);
  }, [transitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  return (
    <section className={styles.hero} id="hero-section">
      {slides.map((slide, idx) => (
        <div key={idx} className={`${styles.slide} ${idx === current ? styles.active : ''} ${transitioning && idx === current ? styles.exiting : ''}`}>
          <div className={styles.slideImage} style={{ backgroundImage: `url(${slide.image})` }} />
          <div className={styles.slideOverlay} />
          <div className={styles.slideContent}>
            <span className={styles.slideSubtitle}>{slide.subtitle}</span>
            <h1 className={styles.slideTitle}>{slide.title}</h1>
            <div className={styles.slideCtas}>
              <Link href={slide.href} className={styles.ctaPrimary}>{slide.cta}</Link>
              <Link href="/shop" className={styles.ctaOutline}>View All</Link>
            </div>
          </div>
        </div>
      ))}
      
      <div className={styles.dots}>
        {slides.map((_, idx) => (
          <button key={idx} className={`${styles.dot} ${idx === current ? styles.dotActive : ''}`} onClick={() => goTo(idx)} aria-label={`Slide ${idx + 1}`} />
        ))}
      </div>

      <div className={styles.scrollIndicator}>
        <span>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
