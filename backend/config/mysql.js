import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const DB_HOST = process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || process.env.MYSQL_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'farmer_market';
const DB_PORT = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10);

let pool = null;
let isMySQLConnected = false;

const INITIAL_USERS = [
  {
    id: 'farmer-1',
    _id: '64a000000000000000000001',
    name: 'Selvam Organic Farms',
    email: 'farmer.coimbatore@demo.com',
    password: 'password123',
    role: 'farmer',
    farmName: 'Green Valley Organics',
    farmLocation: 'Coimbatore, Tamil Nadu',
    address: '12 Alagesan Road, Saibaba Colony',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641011',
    latitude: 11.0168,
    longitude: 76.9558,
    phone: '+91 98450 12345',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    experienceYears: 14,
    hectares: 12.5,
  },
  {
    id: 'farmer-11',
    _id: '64a000000000000000000002',
    name: 'Kumar Farm Organics',
    email: 'kumar.farmer@demo.com',
    password: 'password123',
    role: 'farmer',
    farmName: 'Kumar Organic Acres',
    farmLocation: 'Kovilpatti, Tamil Nadu',
    address: '18 Main Bazaar Road, Kovilpatti',
    city: 'Kovilpatti',
    district: 'Thoothukudi',
    state: 'Tamil Nadu',
    pincode: '628501',
    latitude: 9.1724,
    longitude: 77.8687,
    phone: '+91 98450 77889',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    experienceYears: 16,
    hectares: 18.0,
  },
  {
    id: 'farmer-demo',
    _id: '64a000000000000000000003',
    name: 'Murugan Organic Farm',
    email: 'farmer@demo.com',
    password: 'password123',
    role: 'farmer',
    farmName: 'Murugan Organics',
    farmLocation: 'Coimbatore, Tamil Nadu',
    address: '45 Green Agro Path, Coimbatore',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641001',
    latitude: 11.0168,
    longitude: 76.9558,
    phone: '+91 98450 99887',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    experienceYears: 10,
    hectares: 8.0,
  },
  {
    id: 'buyer-1',
    _id: '64a000000000000000000010',
    name: 'Priya Sundaram',
    email: 'priya.buyer@demo.com',
    password: 'password123',
    role: 'buyer',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641002',
    address: '12B Palm Grove, RS Puram, Coimbatore - 641002',
    latitude: 11.0168,
    longitude: 76.9558,
    phone: '+91 97100 67890',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'buyer-demo',
    _id: '64a000000000000000000011',
    name: 'Ananya Sharma',
    email: 'buyer@demo.com',
    password: 'password123',
    role: 'buyer',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641001',
    address: '88 Race Course Road, Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    phone: '+91 97100 11223',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'delivery-1',
    _id: '64a000000000000000000020',
    name: 'Ramesh Kumar (SpeedyFarm Express)',
    email: 'delivery@demo.com',
    password: 'password123',
    role: 'delivery',
    phone: '+91 98765 43210',
    vehicleType: 'Electric Cargo Van (TN-38-AF-2024)',
    serviceArea: 'Coimbatore & Pollachi Hub',
    region: 'Coimbatore',
    city: 'Coimbatore',
    rating: 4.9,
    completedDeliveries: 342,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-1',
    _id: '64a000000000000000000030',
    name: 'System Administrator',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 98400 11223',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export async function initMySQL() {
  try {
    // 1. Initial connection to verify server and create database if needed
    const tempConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
      connectTimeout: 4000,
    });

    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await tempConnection.end();

    // 2. Create Connection Pool for farmer_market
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      charset: 'utf8mb4',
    });

    // 3. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        _id VARCHAR(64),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('farmer', 'buyer', 'delivery', 'admin') DEFAULT 'buyer',
        farmName VARCHAR(255) DEFAULT '',
        farmLocation VARCHAR(255) DEFAULT '',
        address TEXT,
        city VARCHAR(128) DEFAULT 'Coimbatore',
        district VARCHAR(128) DEFAULT '',
        state VARCHAR(128) DEFAULT 'Tamil Nadu',
        pincode VARCHAR(32) DEFAULT '',
        latitude DECIMAL(10, 6) DEFAULT NULL,
        longitude DECIMAL(10, 6) DEFAULT NULL,
        phone VARCHAR(64) DEFAULT '',
        verified BOOLEAN DEFAULT FALSE,
        avatar TEXT,
        experienceYears INT DEFAULT 0,
        hectares DECIMAL(10, 2) DEFAULT 0,
        vehicleType VARCHAR(255) DEFAULT '',
        serviceArea VARCHAR(255) DEFAULT '',
        region VARCHAR(128) DEFAULT '',
        rating DECIMAL(3, 2) DEFAULT 5.0,
        completedDeliveries INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        _id VARCHAR(64),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        subCategory VARCHAR(128) DEFAULT '',
        price DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(32) DEFAULT 'kg',
        stock INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 5.0,
        reviewsCount INT DEFAULT 0,
        isOrganic BOOLEAN DEFAULT TRUE,
        is_organic BOOLEAN DEFAULT TRUE,
        harvestDate VARCHAR(64) DEFAULT '',
        farmerId VARCHAR(64) NOT NULL,
        farmerName VARCHAR(255) DEFAULT '',
        farmLocation VARCHAR(255) DEFAULT '',
        description TEXT,
        image TEXT,
        featured BOOLEAN DEFAULT FALSE,
        badge VARCHAR(64) DEFAULT '',
        city VARCHAR(128) DEFAULT '',
        district VARCHAR(128) DEFAULT '',
        latitude DECIMAL(10, 6) DEFAULT NULL,
        longitude DECIMAL(10, 6) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        _id VARCHAR(64),
        date VARCHAR(64) NOT NULL,
        buyerId VARCHAR(64) NOT NULL,
        buyerName VARCHAR(255) NOT NULL,
        buyerPhone VARCHAR(64) DEFAULT '',
        deliveryCity VARCHAR(128) DEFAULT 'Coimbatore',
        deliveryAddress TEXT NOT NULL,
        buyerLocation JSON DEFAULT NULL,
        farmerId VARCHAR(64) NOT NULL,
        farmerName VARCHAR(255) DEFAULT '',
        farmLocation VARCHAR(255) DEFAULT '',
        farmDistanceKm DECIMAL(10, 2) DEFAULT 0,
        items JSON NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        deliveryFee DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        paymentMethod VARCHAR(128) DEFAULT 'UPI / QR Payment',
        paymentStatus VARCHAR(64) DEFAULT 'Paid',
        deliveryEarnings DECIMAL(10, 2) DEFAULT 50,
        status VARCHAR(64) DEFAULT 'Pending',
        estimatedDelivery VARCHAR(255) DEFAULT '',
        assignedDeliveryPartner JSON DEFAULT NULL,
        timestamps JSON DEFAULT NULL,
        trackingSteps JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recently_viewed (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(64) NOT NULL,
        productId VARCHAR(64) NOT NULL,
        viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_prod_idx (userId, productId),
        KEY user_view_idx (userId, viewedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    isMySQLConnected = true;
    console.log(`🐬 MySQL Connected Successfully: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    // 4. Auto-seed Users
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      for (const u of INITIAL_USERS) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await pool.query(
          `INSERT INTO users (id, _id, name, email, password, role, farmName, farmLocation, address, city, district, state, pincode, latitude, longitude, phone, verified, avatar, experienceYears, hectares, vehicleType, serviceArea, region)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.id,
            u._id || u.id,
            u.name,
            u.email.toLowerCase(),
            hashedPassword,
            u.role,
            u.farmName || '',
            u.farmLocation || '',
            u.address || '',
            u.city || 'Coimbatore',
            u.district || '',
            u.state || 'Tamil Nadu',
            u.pincode || '',
            u.latitude || null,
            u.longitude || null,
            u.phone || '',
            u.verified ? 1 : 0,
            u.avatar || '',
            u.experienceYears || 0,
            u.hectares || 0,
            u.vehicleType || '',
            u.serviceArea || '',
            u.region || '',
          ]
        );
      }
      console.log('🌱 Seeded demo users into MySQL users table.');
    }

    // 5. Auto-seed Products from products.json
    const [prodRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (prodRows[0].count === 0) {
      try {
        let prodPath = path.join(__dirname, '..', 'data', 'products.json');
        if (!fs.existsSync(prodPath)) {
          prodPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'products.json');
        }
        const raw = fs.readFileSync(prodPath, 'utf-8');
        const prods = JSON.parse(raw);
        for (const p of prods) {
          await pool.query(
            `INSERT INTO products (id, _id, name, category, subCategory, price, unit, stock, rating, reviewsCount, isOrganic, harvestDate, farmerId, farmerName, farmLocation, description, image, featured, badge, city, district, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p._id || p.id,
              p.name,
              p.category,
              p.subCategory || '',
              Number(p.price) || 0,
              p.unit || 'kg',
              Number(p.stock) || 0,
              Number(p.rating) || 5.0,
              Number(p.reviewsCount) || 0,
              p.isOrganic ? 1 : 0,
              p.harvestDate || '',
              p.farmerId || 'farmer-1',
              p.farmerName || 'Local Farm',
              p.farmLocation || '',
              p.description || '',
              p.image || '',
              p.featured ? 1 : 0,
              p.badge || '',
              p.city || '',
              p.district || '',
              p.latitude || null,
              p.longitude || null,
            ]
          );
        }
        console.log(`🌱 Seeded ${prods.length} products into MySQL products table.`);
      } catch (e) {
        console.warn('MySQL product seed warning:', e.message);
      }
    }

    return true;
  } catch (err) {
    isMySQLConnected = false;
    console.log(`⚠️  MySQL not connected (${err.message}). Using persistent in-memory / JSON store.`);
    return false;
  }
}

export function getMySQLPool() {
  return pool;
}

export function getIsMySQLConnected() {
  return isMySQLConnected && pool !== null;
}
