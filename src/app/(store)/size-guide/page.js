import styles from './sizeguide.module.css';

export const metadata = {
  title: 'Size Guide — Cloth Ship',
  description: 'Detailed measurement charts and instructions to find your perfect fit for Men\'s Panjabis, Waistcoats, and Women\'s Kurtas.',
};

export default function SizeGuidePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Measurement Chart</span>
          <h1 className={styles.heroTitle}>Size Guide</h1>
          <p className={styles.heroDesc}>Find your perfect fit. Review our detailed measurement tables for Men's and Women's collections and learn how to measure correctly.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          
          {/* Men's Panjabi Guide */}
          <div className={styles.guideBlock}>
            <h2 className={styles.blockTitle}>Men's Panjabi Size Chart</h2>
            <p className={styles.blockDesc}>Measurements below are in inches and refer to the garment dimensions. For a relaxed fit, select a size where the garment chest is 2-4 inches larger than your actual body measurement.</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Shoulder (in)</th>
                    <th>Sleeve Length (in)</th>
                    <th>Body Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>S</td><td>38</td><td>16.5</td><td>24</td><td>38</td></tr>
                  <tr><td>M</td><td>40</td><td>17</td><td>24.5</td><td>40</td></tr>
                  <tr><td>L</td><td>42</td><td>17.5</td><td>25</td><td>42</td></tr>
                  <tr><td>XL</td><td>44</td><td>18.5</td><td>25.5</td><td>44</td></tr>
                  <tr><td>XXL</td><td>46</td><td>19.5</td><td>26</td><td>46</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Men's Waistcoat Guide */}
          <div className={styles.guideBlock}>
            <h2 className={styles.blockTitle}>Men's Waistcoat Size Chart</h2>
            <p className={styles.blockDesc}>Garment dimensions in inches. Designed to fit snugly over a Panjabi or Kurta.</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Shoulder (in)</th>
                    <th>Body Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>S</td><td>39</td><td>14.5</td><td>26.5</td></tr>
                  <tr><td>M</td><td>41</td><td>15</td><td>27.5</td></tr>
                  <tr><td>L</td><td>43</td><td>15.5</td><td>28.5</td></tr>
                  <tr><td>XL</td><td>45</td><td>16.5</td><td>29.5</td></tr>
                  <tr><td>XXL</td><td>47</td><td>17.5</td><td>30.5</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Women's Kurta Guide */}
          <div className={styles.guideBlock}>
            <h2 className={styles.blockTitle}>Women's Kurta & Salwar Kameez Size Chart</h2>
            <p className={styles.blockDesc}>Garment dimensions in inches. Select the chest size that is 2 inches larger than your body measurement for an optimal contemporary silhouette.</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Waist (in)</th>
                    <th>Hip (in)</th>
                    <th>Body Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>XS</td><td>34</td><td>30</td><td>36</td><td>36</td></tr>
                  <tr><td>S</td><td>36</td><td>32</td><td>38</td><td>38</td></tr>
                  <tr><td>M</td><td>38</td><td>34</td><td>40</td><td>40</td></tr>
                  <tr><td>L</td><td>40</td><td>36</td><td>42</td><td>42</td></tr>
                  <tr><td>XL</td><td>42</td><td>38</td><td>44</td><td>44</td></tr>
                  <tr><td>XXL</td><td>44</td><td>40</td><td>46</td><td>45</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Saree Info */}
          <div className={styles.guideBlock}>
            <h2 className={styles.blockTitle}>Saree & Free Size Garments</h2>
            <p className={styles.blockDesc}>Sarees do not require size selection as they are draped garments. Our sarees are crafted in the standard traditional length of <strong>5.5 meters (6 yards)</strong> and a width of 1.1 meters. All sarees come with an additional <strong>0.8 to 1 meter</strong> of unstitched fabric at the end for tailoring a custom blouse to your measurements.</p>
          </div>

          {/* How to Measure */}
          <div className={styles.infoBlock}>
            <h2>How to Measure</h2>
            <p>Using a flexible measuring tape, measure yourself keeping the tape level and comfortably snug (not too tight). It is recommended to measure over thin underwear.</p>
            <ul className={styles.measureList}>
              <li><strong>Chest/Bust:</strong> Wrap the tape around the fullest part of your chest or bust, keeping the tape horizontal and parallel to the floor.</li>
              <li><strong>Shoulder:</strong> Measure from the edge of one shoulder bone across the back of the neck to the edge of the opposite shoulder bone.</li>
              <li><strong>Waist:</strong> Measure around your natural waistline, which is the narrowest part of your torso (usually located just above your belly button).</li>
              <li><strong>Hip:</strong> Stand with your feet together and measure around the fullest part of your hips and buttocks.</li>
              <li><strong>Length:</strong> Measure from the highest point of the shoulder (where the shoulder seam meets the collar) straight down to the desired hemline.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
