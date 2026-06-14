'use client';
import { useState } from 'react';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Style & Sizing Consultation',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Your inquiry was sent successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Style & Sizing Consultation',
          message: ''
        });
      } else {
        setError(data.error || 'Failed to send your inquiry.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Get in Touch</span>
          <h1 className={styles.heroTitle}>Bespoke Consultations & Support</h1>
          <p className={styles.heroDesc}>Planning a wedding wardrobe, interested in custom sizes, or placing a bulk order? Connect directly with our textile designers and customer support.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* Contact Info Sidebar */}
            <div className={styles.infoSidebar}>
              <div className={styles.infoCard}>
                <h3>Our Store</h3>
                <p className={styles.address}>🏬 Physical store coming soon!</p>
                <p className={styles.hours}>We are currently running fully online. Shop anytime, from anywhere.</p>
              </div>

              <div className={styles.infoCard}>
                <h3>Direct Hotline</h3>
                <a href="tel:+8801343895708" className={styles.link}>+880 1343 895708</a>
                <p className={styles.hours}>Available Sat-Thu: 9 AM - 6 PM</p>
              </div>

              <div className={styles.infoCard}>
                <h3>Email Inquiries</h3>
                <a href="mailto:info.clothship@gmail.com" className={styles.link}>info.clothship@gmail.com</a>
                <p className={styles.hours}>We reply within 24 hours</p>
              </div>

              <div className={styles.inquiryHelp}>
                <h4>Why Consult Us?</h4>
                <ul className={styles.helpList}>
                  <li><strong>Custom Fittings:</strong> Consult on tailor-made lengths for sarees and panjabis.</li>
                  <li><strong>Bridal Consultations:</strong> Plan coordinated outfits for your wedding party.</li>
                  <li><strong>Wholesale Pricing:</strong> Discuss discounted rates on bulk corporate orders.</li>
                </ul>
              </div>
            </div>

            {/* Contact Lead Form */}
            <div className={styles.formContainer}>
              <h2>Send an Inquiry</h2>
              <p className={styles.formSubtitle}>Select a specific category below so we can route your message to the appropriate designer.</p>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label htmlFor="phone">Phone Number (optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+880 17..."
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="subject">Inquiry Type *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="Style & Sizing Consultation">Style & Sizing Consultation</option>
                      <option value="Custom Bridal & Groom Fitting">Custom Bridal & Groom Fitting</option>
                      <option value="Boutique / Bulk Wholesale Inquiry">Boutique / Bulk Wholesale Inquiry</option>
                      <option value="Saree Pre-order & Restocks">Saree Pre-order & Restocks</option>
                      <option value="General Support / Inquiries">General Support / Inquiries</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="message">Your Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="6"
                    placeholder="Tell us about your sizing needs, quantity requirements, or queries..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={loading}
                  ></textarea>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Sending Message...' : 'Send Inquiry Message'}
                </button>

                {message && <div className={styles.successMsg}>{message}</div>}
                {error && <div className={styles.errorMsg}>{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
