'use client';
import { useState, useEffect } from 'react';
import styles from './FloatingContact.module.css';

/* ── Config ──────────────────────────────────────────────────────────────
   WhatsApp: a public link can only open a 1:1 chat with ONE number
   (wa.me/<number>). There is no way to auto-create a group with the
   customer, so we let them pick which of our lines to message.
   Relabel these to match your real team roles if you like.                */
const WHATSAPP_NUMBERS = [
  { label: 'Sales & Orders', number: '8801860242267' },
  { label: 'Customer Support', number: '8801788161616' },
  { label: 'General Enquiry', number: '8801303037577' },
];
const WHATSAPP_TEXT = 'Hi Cloth Ship! I would like to know more about your collection.';

/* Messenger: for a true one-tap "Message" deep link, replace this with
   https://m.me/<your-page-username-or-numeric-id>. Until then it opens the
   Facebook page, from which the customer can tap "Message".                */
const MESSENGER_URL = 'https://www.facebook.com/share/1NgmhG5XYE/';

export default function FloatingContact() {
  const [waOpen, setWaOpen] = useState(false);

  // Close the WhatsApp picker on Escape
  useEffect(() => {
    if (!waOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setWaOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [waOpen]);

  const waLink = (number) =>
    `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <div className={styles.wrap}>
      {waOpen && <div className={styles.backdrop} onClick={() => setWaOpen(false)} aria-hidden="true" />}

      {waOpen && (
        <div className={styles.waPanel} role="dialog" aria-label="Chat with us on WhatsApp">
          <div className={styles.waHead}>
            <span>Chat with us on WhatsApp</span>
            <button className={styles.waClose} onClick={() => setWaOpen(false)} aria-label="Close">✕</button>
          </div>
          <p className={styles.waSub}>Pick a line — we usually reply within minutes.</p>
          {WHATSAPP_NUMBERS.map(({ label, number }) => (
            <a
              key={number}
              href={waLink(number)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waItem}
              onClick={() => setWaOpen(false)}
            >
              <span className={styles.waItemAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
              </span>
              <span className={styles.waItemText}>
                <strong>{label}</strong>
                <small>+{number}</small>
              </span>
              <span className={styles.waItemGo} aria-hidden="true">›</span>
            </a>
          ))}
        </div>
      )}

      <div className={styles.stack}>
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.fab} ${styles.messenger}`}
          aria-label="Message us on Messenger"
          title="Message us on Messenger"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/></svg>
        </a>
        <button
          type="button"
          className={`${styles.fab} ${styles.whatsapp}`}
          onClick={() => setWaOpen((o) => !o)}
          aria-label="Chat with us on WhatsApp"
          aria-expanded={waOpen}
          title="Chat with us on WhatsApp"
        >
          <span className={styles.pulse} aria-hidden="true" />
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.945c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.447h.006c6.585 0 11.946-5.36 11.949-11.945a11.9 11.9 0 00-3.48-8.4"/></svg>
        </button>
      </div>
    </div>
  );
}
