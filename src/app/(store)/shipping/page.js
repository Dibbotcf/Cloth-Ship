import styles from './shipping.module.css';

export const metadata = {
  title: 'Shipping & Delivery — Cloth Ship',
  description: 'Cloth Ship\'s shipping and delivery policy within Bangladesh. Read about our standard rates, timelines, and tracking information.',
};

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Customer Support</span>
          <h1 className={styles.heroTitle}>Shipping & Delivery</h1>
          <p className={styles.heroDesc}>Everything you need to know about our shipping rates, delivery timelines, and order tracking across Bangladesh.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Delivery Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.icon}>🚚</span>
                <h2>Timelines & Schedule</h2>
              </div>
              <p className={styles.cardText}>We aim to dispatch all orders within 24 hours of placement (excluding Fridays and national holidays). Our delivery schedule is as follows:</p>
              <ul className={styles.list}>
                <li><strong>Inside Dhaka:</strong> 1 - 3 business days</li>
                <li><strong>Dhaka Suburbs (Savar, Gazipur, Narayanganj):</strong> 2 - 4 business days</li>
                <li><strong>Outside Dhaka (All other districts):</strong> 3 - 5 business days</li>
              </ul>
            </div>

            {/* Rates Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.icon}>🏷️</span>
                <h2>Shipping Rates</h2>
              </div>
              <p className={styles.cardText}>Our shipping rates are calculated at checkout based on your delivery address. Here are our flat-rate shipping tiers:</p>
              <ul className={styles.list}>
                <li><strong>Inside Dhaka:</strong> ৳80</li>
                <li><strong>Outside Dhaka:</strong> ৳150</li>
                <li><strong>Orders above ৳3,000:</strong> FREE shipping nationwide</li>
              </ul>
            </div>
          </div>

          <div className={styles.infoBlock}>
            <h2>Cash on Delivery (COD)</h2>
            <p>For your convenience, we offer Cash on Delivery (COD) services throughout Bangladesh. With COD, you can pay in cash to the courier representative at the moment of receiving your package. Please make sure the exact payable amount is ready upon delivery.</p>
            
            <h2>Order Tracking</h2>
            <p>Once your order has been dispatched from our warehouse, you will receive a confirmation SMS and email containing a unique tracking number and courier service details. You can track your parcel in real-time through the courier partner's online portal using the link provided.</p>

            <h2>Delivery Policy Notes</h2>
            <p>1. Please verify your shipping address and phone number during checkout to avoid delivery delays.</p>
            <p>2. Couriers will make up to three attempts to deliver your package. If unsuccessful, the order will be returned to our warehouse. Redelivery may incur additional shipping charges.</p>
            <p>3. During peak holiday seasons or severe weather conditions, deliveries may take slightly longer. We appreciate your patience during these times.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
