'use client';
import { useState, useEffect } from 'react';
import styles from './ProductCardImage.module.css';

export default function ProductCardImage({ product, className }) {
  // Extract all unique images
  const images = [];
  if (product.image) {
    product.image.split(',').forEach(img => {
      const trimmed = img.trim();
      if (trimmed) images.push(trimmed);
    });
  }
  if (product.hover_image) {
    product.hover_image.split(',').forEach(img => {
      const trimmed = img.trim();
      if (trimmed && !images.includes(trimmed)) images.push(trimmed);
    });
  }

  // Fallback if no images found
  if (images.length === 0) {
    images.push('/images/placeholder.png');
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState(styles.fadeIn);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      // Trigger fade out first
      setFadeState(styles.fadeOut);
      
      // Wait for fade out animation to update image source, then fade in
      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        setFadeState(styles.fadeIn);
      }, 300);

    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={styles.imageContainer}>
      <img
        src={images[currentIndex]}
        alt={product.name || 'Product'}
        className={`${styles.img} ${fadeState} ${className || ''}`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
