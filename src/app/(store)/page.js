import HeroSlider from '@/components/HeroSlider';
import FeaturedCategories from '@/components/FeaturedCategories';
import BrandStory from '@/components/BrandStory';
import AllProducts from '@/components/AllProducts';
import NewArrivals from '@/components/NewArrivals';
import InstagramFeed from '@/components/InstagramFeed';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.homePage}>
      <HeroSlider />
      <FeaturedCategories />
      <NewArrivals />
      <BrandStory />
      <AllProducts />
      <InstagramFeed />
    </div>
  );
}
