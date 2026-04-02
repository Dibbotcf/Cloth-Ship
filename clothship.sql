-- phpMyAdmin SQL Dump
-- Database: `clothship`
-- Host: localhost

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `fabric` varchar(50) DEFAULT NULL,
  `occasion` varchar(50) DEFAULT NULL,
  `colors` json DEFAULT NULL,
  `sizes` json DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `hover_image` varchar(500) DEFAULT NULL,
  `description` text,
  `story` text,
  `material` text,
  `is_new` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `slug`, `name`, `price`, `original_price`, `category`, `gender`, `fabric`, `occasion`, `colors`, `sizes`, `image`, `hover_image`, `description`, `story`, `material`, `is_new`, `is_featured`) VALUES
(1, 'royal-crimson-silk-saree', 'Royal Crimson Silk Saree', 8500.00, 12000.00, 'sarees', 'women', 'Silk', 'Wedding', '["Crimson", "Gold"]', '["Free Size"]', '/images/products/saree-red.png', '/images/products/saree-red.png', 'A breathtaking crimson silk saree with intricate gold zari work, perfect for weddings and grand celebrations.', 'Handwoven by master artisans from Rajshahi, this saree takes over 15 days to complete. Each motif tells a story of Bengali heritage.', '100% Pure Silk with Gold Zari border. Dry clean only.', 1, 1),
(2, 'ivory-elegance-panjabi', 'Ivory Elegance Panjabi', 3200.00, 4500.00, 'panjabis', 'men', 'Cotton', 'Casual', '["Ivory", "Gold"]', '["S", "M", "L", "XL", "XXL"]', '/images/products/panjabi-white.png', '/images/products/panjabi-white.png', 'A premium cotton panjabi with subtle gold embroidery on collar and cuffs.', 'Crafted from the finest Comilla cotton, this panjabi embodies understated elegance for the modern gentleman.', '100% Premium Cotton. Machine wash gentle cycle.', 1, 1),
(3, 'royal-blue-embroidered-kurta', 'Royal Blue Embroidered Kurta', 2800.00, 3800.00, 'kurtas-women', 'women', 'Cotton Blend', 'Festival', '["Royal Blue", "Silver"]', '["XS", "S", "M", "L", "XL"]', '/images/products/kurta-blue.png', '/images/products/kurta-blue.png', 'An elegant royal blue kurta with silver thread embroidery and mirror work.', 'This kurta draws inspiration from Mughal architecture, featuring geometric patterns that echo the grandeur of ancient palaces.', 'Cotton blend with silver threadwork. Hand wash recommended.', 1, 1),
(4, 'emerald-garden-salwar-kameez', 'Emerald Garden Salwar Kameez', 4200.00, 5500.00, 'salwar-kameez', 'women', 'Georgette', 'Festival', '["Emerald Green", "Gold"]', '["S", "M", "L", "XL"]', '/images/products/salwar-green.png', '/images/products/salwar-green.png', 'An elegant emerald green salwar kameez set with gold thread embroidery.', 'Inspired by the lush gardens of Bengal, this ensemble brings nature''s elegance to your wardrobe.', 'Premium Georgette with gold zari work. Dry clean recommended.', 0, 1),
(5, 'heritage-maroon-waistcoat', 'Heritage Maroon Waistcoat', 2500.00, 3200.00, 'waistcoats', 'men', 'Silk Blend', 'Wedding', '["Maroon", "Gold"]', '["S", "M", "L", "XL", "XXL"]', '/images/products/waistcoat-maroon.png', '/images/products/waistcoat-maroon.png', 'A premium maroon silk waistcoat with gold embroidery and decorative buttons.', 'This waistcoat bridges the gap between tradition and modernity, bringing regal charm to any outfit.', 'Silk blend with hand-stitched gold embroidery. Dry clean only.', 0, 1),
(6, 'midnight-noir-fatua', 'Midnight Noir Fatua', 1800.00, 2400.00, 'fatua', 'men', 'Cotton', 'Casual', '["Black", "Charcoal"]', '["S", "M", "L", "XL"]', '/images/products/fatua-black.png', '/images/products/fatua-black.png', 'A stylish black fatua with subtle geometric patterns and mandarin collar.', 'Where street style meets Bangladeshi tradition — the perfect everyday piece for the fashion-forward man.', '100% Premium Cotton. Machine wash gentle cycle.', 1, 0);

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `zip` varchar(20) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `size` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
