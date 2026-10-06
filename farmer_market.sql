-- Farmer Market Portal MySQL Database Dump
-- Created for XAMPP / phpMyAdmin / MySQL Workbench

CREATE DATABASE IF NOT EXISTS `farmer_market` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `farmer_market`;

-- 1. Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(64) NOT NULL,
  `_id` varchar(64) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('farmer','buyer','delivery','admin') DEFAULT 'buyer',
  `farmName` varchar(255) DEFAULT '',
  `farmLocation` varchar(255) DEFAULT '',
  `address` text DEFAULT NULL,
  `city` varchar(128) DEFAULT 'Coimbatore',
  `district` varchar(128) DEFAULT '',
  `state` varchar(128) DEFAULT 'Tamil Nadu',
  `pincode` varchar(32) DEFAULT '',
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `phone` varchar(64) DEFAULT '',
  `verified` tinyint(1) DEFAULT 0,
  `avatar` text DEFAULT NULL,
  `experienceYears` int(11) DEFAULT 0,
  `hectares` decimal(10,2) DEFAULT 0.00,
  `vehicleType` varchar(255) DEFAULT '',
  `serviceArea` varchar(255) DEFAULT '',
  `region` varchar(128) DEFAULT '',
  `rating` decimal(3,2) DEFAULT 5.00,
  `completedDeliveries` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table structure for table `products`
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(64) NOT NULL,
  `_id` varchar(64) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(128) NOT NULL,
  `subCategory` varchar(128) DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(32) DEFAULT 'kg',
  `stock` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 5.00,
  `reviewsCount` int(11) DEFAULT 0,
  `isOrganic` tinyint(1) DEFAULT 1,
  `harvestDate` varchar(64) DEFAULT '',
  `farmerId` varchar(64) NOT NULL,
  `farmerName` varchar(255) DEFAULT '',
  `farmLocation` varchar(255) DEFAULT '',
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `badge` varchar(64) DEFAULT '',
  `city` varchar(128) DEFAULT '',
  `district` varchar(128) DEFAULT '',
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table structure for table `orders`
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(64) NOT NULL,
  `_id` varchar(64) DEFAULT NULL,
  `date` varchar(64) NOT NULL,
  `buyerId` varchar(64) NOT NULL,
  `buyerName` varchar(255) NOT NULL,
  `buyerPhone` varchar(64) DEFAULT '',
  `deliveryCity` varchar(128) DEFAULT 'Coimbatore',
  `deliveryAddress` text NOT NULL,
  `buyerLocation` json DEFAULT NULL,
  `farmerId` varchar(64) NOT NULL,
  `farmerName` varchar(255) DEFAULT '',
  `farmLocation` varchar(255) DEFAULT '',
  `farmDistanceKm` decimal(10,2) DEFAULT 0.00,
  `items` json NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `deliveryFee` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(128) DEFAULT 'UPI / QR Payment',
  `paymentStatus` varchar(64) DEFAULT 'Paid',
  `deliveryEarnings` decimal(10,2) DEFAULT 50.00,
  `status` varchar(64) DEFAULT 'Pending',
  `estimatedDelivery` varchar(255) DEFAULT '',
  `assignedDeliveryPartner` json DEFAULT NULL,
  `timestamps` json DEFAULT NULL,
  `trackingSteps` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
