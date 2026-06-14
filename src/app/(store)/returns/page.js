import styles from './returns.module.css';

export const metadata = {
  title: 'Returns & Exchange — Cloth Ship',
  description: 'Read Cloth Ship\'s return and exchange policy. Enjoy hassle-free 7-day exchanges and quick refunds for dynamic customer experience.',
};

export default function ReturnsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Customer Support</span>
          <h1 className={styles.heroTitle}>Returns & Exchange</h1>
          <p className={styles.heroDesc}>We want you to love what you ordered. Read our straightforward guidelines on return, exchange, and refunds.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.policySummary}>
            <h2>Hassle-Free 7-Day Exchange Policy</h2>
            <p>At Cloth Ship, customer satisfaction is our top priority. If a product does not fit correctly, or if you change your mind, we gladly accept returns and exchanges within **7 days** of the delivery date, subject to the conditions detailed below.</p>
          </div>

          <div className={styles.grid}>
            {/* Conditions Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.icon}>📋</span>
                <h2>Acceptance Conditions</h2>
              </div>
              <p className={styles.cardText}>To be eligible for an exchange or refund, the items must satisfy the following conditions:</p>
              <ul className={styles.list}>
                <li>The item must be unused, unworn, and unwashed.</li>
                <li>Original tags, brand labels, and packaging must be intact.</li>
                <li>Proof of purchase (invoice or order confirmation) must be provided.</li>
                <li>Clearance and customized stitched items are not eligible.</li>
              </ul>
            </div>

            {/* Steps Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.icon}>⚡</span>
                <h2>How to Exchange</h2>
              </div>
              <p className={styles.cardText}>Exchanging your order is simple and quick. Follow these three steps:</p>
              <ol className={styles.olList}>
                <li><strong>Request:</strong> Contact our helpline (+880 1343 895708) or email (info.clothship@gmail.com) stating your order number and request.</li>
                <li><strong>Return:</strong> Send the item back via your preferred courier or bring it directly to our outlet.</li>
                <li><strong>Dispatch:</strong> Once inspected, we will dispatch your replacement free of standard shipping fees.</li>
              </ol>
            </div>
          </div>

          <div className={styles.infoBlock}>
            <h2>Refund Policy & Timeline</h2>
            <p>If you prefer a refund instead of an exchange, we will issue a full refund of the product purchase price. Please note that shipping fees are non-refundable unless the return is due to our error (e.g. damaged or incorrect item delivered).</p>
            <p>Once your returned item is received and inspected at our warehouse, your refund will be initiated. It takes approximately **3 - 5 business days** for the refund amount to reflect in your account. We offer refunds through:</p>
            <ul className={styles.list}>
              <li><strong>Mobile Financial Services:</strong> bKash, Nagad, or Rocket.</li>
              <li><strong>Bank Transfer:</strong> Direct deposit to your local bank account.</li>
              <li><strong>Store Credit:</strong> An instant digital coupon code to use on future purchases.</li>
            </ul>

            <h2>Damaged or Defective Items</h2>
            <p>If you receive a damaged, stained, or defective item, please contact us immediately within 24 hours of delivery. Share clear photos of the defect, and we will arrange a complimentary pickup and express replacement at no extra charge.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
