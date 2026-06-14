'use client';
import { useState } from 'react';
import styles from './faq.module.css';

const faqData = [
  {
    category: 'Orders & Payments',
    items: [
      {
        question: 'How do I place an order?',
        answer: 'Browse our collection, select your desired size and color on the product details page, and click "Add to Cart". When you are ready, click on the shopping cart icon at the top right to view your bag and proceed to checkout. Follow the prompts to enter your shipping details and select a payment method.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Cash on Delivery (COD) nationwide, as well as digital payments including bKash, Nagad, Rocket, Visa, Mastercard, and American Express. Select your preferred method at checkout.'
      },
      {
        question: 'Can I cancel or modify my order after placing it?',
        answer: 'If you need to change or cancel your order, please call our customer service hotline (+880 1343 895708) immediately. We process orders quickly, but we will do our best to accommodate your request if the package has not yet left our warehouse.'
      }
    ]
  },
  {
    category: 'Sizing & Products',
    items: [
      {
        question: 'How do I determine the correct size for me?',
        answer: 'We provide detailed measurements on our dedicated Size Guide page. Each product also has sizing details listed. If you are between sizes, we generally recommend sizing up for a comfortable traditional fit.'
      },
      {
        question: 'Do you offer custom tailoring or adjustments?',
        answer: 'Currently, we only offer the sizes listed on our storefront. We do not provide in-house alterations or custom tailoring. For sarees, they are standard free size and come with unstitched blouse pieces.'
      },
      {
        question: 'How should I wash and care for my garments?',
        answer: 'For pure silk sarees and embroidered waistcoats, we strongly recommend professional dry cleaning only. For premium cotton panjabis, fatuas, and kurtas, you can machine wash them on a gentle cycle in cold water and iron at a medium temperature.'
      }
    ]
  },
  {
    category: 'Shipping & Returns',
    items: [
      {
        question: 'How much does shipping cost?',
        answer: 'We charge a flat rate of ৳80 for deliveries inside Dhaka and ৳150 for deliveries outside Dhaka. We offer FREE nationwide shipping on all orders totaling ৳3,000 or more.'
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer a hassle-free 7-day exchange and return policy for all unworn, unwashed items with their original tags intact. Simply contact us to request an exchange, and once we inspect the returned item, we will dispatch the replacement.'
      },
      {
        question: 'How long does it take to process refunds?',
        answer: 'Refunds are initiated immediately upon successful inspection of your returned package at our warehouse. It generally takes 3 to 5 business days for the funds to appear in your bank account or MFS wallet (bKash/Nagad).'
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndexes, setOpenIndexes] = useState({});

  const toggleAccordion = (catIndex, itemIndex) => {
    const key = `${catIndex}-${itemIndex}`;
    setOpenIndexes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Help Center</span>
          <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
          <p className={styles.heroDesc}>Have a question? We have compiled responses to our most common queries regarding ordering, payments, shipping, and care.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          {faqData.map((cat, catIdx) => (
            <div key={cat.category} className={styles.faqCategorySection}>
              <h2 className={styles.categoryTitle}>{cat.category}</h2>
              <div className={styles.accordionList}>
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = !!openIndexes[key];

                  return (
                    <div key={item.question} className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
                      <button
                        className={styles.accordionHeader}
                        onClick={() => toggleAccordion(catIdx, itemIdx)}
                        aria-expanded={isOpen}
                      >
                        <span className={styles.questionText}>{item.question}</span>
                        <span className={styles.accordionArrow}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                        </span>
                      </button>
                      <div className={`${styles.accordionContent} ${isOpen ? styles.contentOpen : ''}`}>
                        <div className={styles.contentInner}>
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
