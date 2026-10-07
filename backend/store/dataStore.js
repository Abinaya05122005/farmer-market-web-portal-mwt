import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getIsMySQLConnected, getMySQLPool } from '../config/mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const INITIAL_USERS = [
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

let initialProducts = [];
try {
  let prodPath = path.join(__dirname, '..', 'data', 'products.json');
  if (!fs.existsSync(prodPath)) {
    prodPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'products.json');
  }
  const rawProducts = fs.readFileSync(prodPath, 'utf-8');
  initialProducts = JSON.parse(rawProducts);
} catch (err) {
  console.warn('Could not read products.json:', err.message);
}

export function isDeliveryPartnerLocationMatch(partner, order) {
  if (!partner || !order) return false;
  if (partner.role === 'admin') return true;

  const partnerId1 = partner.id ? String(partner.id) : '';
  const partnerId2 = partner._id ? String(partner._id) : '';
  const partnerEmail = String(partner.email || '').toLowerCase().trim();

  const assignedPartner = typeof order.assignedDeliveryPartner === 'string'
    ? JSON.parse(order.assignedDeliveryPartner)
    : order.assignedDeliveryPartner;

  const assignedId = assignedPartner ? String(assignedPartner.id || assignedPartner._id || '') : '';
  const assignedEmail = assignedPartner ? String(assignedPartner.email || '').toLowerCase().trim() : '';

  if (assignedId || assignedEmail) {
    if (assignedId && (assignedId === partnerId1 || assignedId === partnerId2)) return true;
    if (partnerEmail && assignedEmail && assignedEmail === partnerEmail) return true;
    return false;
  }

  const validHandoverStatuses = ['Ready for Pickup', 'Accepted', 'Processing'];
  if (!validHandoverStatuses.includes(order.status)) return false;

  const partnerCity = String(partner.city || partner.region || '').toLowerCase().trim();
  const partnerServiceArea = String(partner.serviceArea || '').toLowerCase().trim();
  const partnerLocFull = `${partnerCity} ${partnerServiceArea}`.trim();

  const farmLoc = String(order.farmLocation || order.farmerLocation || '').toLowerCase().trim();
  const delivCity = String(order.deliveryCity || '').toLowerCase().trim();
  const delivAddress = String(order.deliveryAddress || '').toLowerCase().trim();
  const orderLocFull = `${farmLoc} ${delivCity} ${delivAddress}`.trim();

  if (!partnerLocFull || !orderLocFull) return false;

  const CLUSTERS = [
    { name: 'thoothukudi_kovilpatti', cities: ['kovilpatti', 'guruvarpatti', 'thoothukudi', 'tuticorin', 'ettayapuram', 'vilathikulam', 'kayathar', 'sattur', 'virudhunagar', 'sivakasi'] },
    { name: 'coimbatore_kongu', cities: ['coimbatore', 'pollachi', 'sulur', 'mettupalayam', 'tiruppur', 'erode', 'gobichettipalayam', 'nilgiris', 'ooty'] },
    { name: 'madurai_south', cities: ['madurai', 'melur', 'usilampatti', 'tirunelveli', 'tenkasi', 'nagercoil', 'dindigul'] },
    { name: 'salem_central', cities: ['salem', 'attur', 'namakkal', 'karur', 'trichy', 'thanjavur'] },
    { name: 'chennai_north', cities: ['chennai', 'tambaram', 'avadi', 'kanchipuram', 'vellore', 'tiruvallur'] }
  ];

  for (const cluster of CLUSTERS) {
    const partnerInCluster = cluster.cities.some(c => partnerLocFull.includes(c));
    const orderInCluster = cluster.cities.some(c => orderLocFull.includes(c));
    if (partnerInCluster && orderInCluster) return true;
  }

  if (partnerCity && (orderLocFull.includes(partnerCity) || farmLoc.includes(partnerCity) || delivCity.includes(partnerCity))) {
    return true;
  }

  return false;
}

export function isFarmerOrderLocationMatch(farmer, order) {
  if (!farmer || !order) return false;
  if (farmer.role === 'admin') return true;

  const farmerId1 = farmer.id ? String(farmer.id).trim() : '';
  const farmerId2 = farmer._id ? String(farmer._id).trim() : '';
  const farmerName = String(farmer.name || '').toLowerCase().trim();
  const farmName = String(farmer.farmName || '').toLowerCase().trim();

  const oFarmerId = String(order.farmerId || order.farmer || '').trim();
  const oFarmerName = String(order.farmerName || '').toLowerCase().trim();

  // 1. Direct Farmer ID Match
  if (oFarmerId && (oFarmerId === farmerId1 || oFarmerId === farmerId2)) return true;

  // 2. Direct Farmer Name / Farm Name Match
  if (oFarmerName && (oFarmerName === farmerName || (farmName && oFarmerName === farmName))) return true;

  // 3. Direct Item Ownership Match
  const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
  if (Array.isArray(items)) {
    const hasMyItem = items.some((item) => {
      const iFarmerId = String(item.farmerId || item.farmer || '').trim();
      const iFarmerName = String(item.farmerName || '').toLowerCase().trim();
      return (
        (iFarmerId && (iFarmerId === farmerId1 || iFarmerId === farmerId2)) ||
        (iFarmerName && (iFarmerName === farmerName || (farmName && iFarmerName === farmName)))
      );
    });
    if (hasMyItem) return true;
  }

  // 4. Location-Based Matching
  const farmerCity = String(farmer.city || '').toLowerCase().trim();
  const farmerDistrict = String(farmer.district || '').toLowerCase().trim();
  const farmerLoc = String(farmer.farmLocation || farmer.address || '').toLowerCase().trim();
  let farmerLocFull = `${farmerCity} ${farmerDistrict} ${farmerLoc}`.trim();

  if (farmerLoc.includes('kovilpatti') || farmerCity.includes('kovilpatti')) {
    farmerLocFull += ' kovilpatti thoothukudi guruvarpatti';
  } else if (farmerLoc.includes('coimbatore') || farmerCity.includes('coimbatore')) {
    farmerLocFull += ' coimbatore';
  }

  const orderDelivCity = String(order.deliveryCity || '').toLowerCase().trim();
  const orderDelivAddress = String(order.deliveryAddress || '').toLowerCase().trim();
  const orderFarmLoc = String(order.farmLocation || '').toLowerCase().trim();

  let orderBuyerCity = '';
  let orderBuyerDistrict = '';
  const buyerLoc = typeof order.buyerLocation === 'string' ? JSON.parse(order.buyerLocation || '{}') : (order.buyerLocation || {});
  if (buyerLoc) {
    orderBuyerCity = String(buyerLoc.city || '').toLowerCase().trim();
    orderBuyerDistrict = String(buyerLoc.district || '').toLowerCase().trim();
  }
  const orderLocFull = `${orderDelivCity} ${orderDelivAddress} ${orderFarmLoc} ${orderBuyerCity} ${orderBuyerDistrict}`.trim();

  if (!farmerLocFull || !orderLocFull) return false;

  const CLUSTERS = [
    { name: 'thoothukudi_kovilpatti', cities: ['kovilpatti', 'guruvarpatti', 'thoothukudi', 'tuticorin', 'ettayapuram', 'vilathikulam', 'kayathar', 'sattur', 'virudhunagar', 'sivakasi'] },
    { name: 'coimbatore_kongu', cities: ['coimbatore', 'pollachi', 'sulur', 'mettupalayam', 'tiruppur', 'erode', 'gobichettipalayam', 'nilgiris', 'ooty'] },
    { name: 'madurai_south', cities: ['madurai', 'melur', 'usilampatti', 'tirunelveli', 'tenkasi', 'nagercoil', 'dindigul'] },
    { name: 'salem_central', cities: ['salem', 'attur', 'namakkal', 'karur', 'trichy', 'thanjavur'] },
    { name: 'chennai_north', cities: ['chennai', 'tambaram', 'avadi', 'kanchipuram', 'vellore', 'tiruvallur'] }
  ];

  for (const cluster of CLUSTERS) {
    const farmerInCluster = cluster.cities.some(c => farmerLocFull.includes(c));
    const orderInCluster = cluster.cities.some(c => orderLocFull.includes(c));
    if (farmerInCluster && orderInCluster) return true;
  }

  if (farmerCity && (orderLocFull.includes(farmerCity) || orderDelivCity.includes(farmerCity))) {
    return true;
  }
  if (orderDelivCity && (farmerLocFull.includes(orderDelivCity) || farmerCity.includes(orderDelivCity))) {
    return true;
  }
  if (farmerDistrict && orderBuyerDistrict && farmerDistrict === orderBuyerDistrict) {
    return true;
  }

  return false;
}

class DataStore {
  constructor() {
    this.users = [];
    this.products = [];
    this.orders = [];
    this.init();
  }

  async init() {
    this.users = await Promise.all(
      INITIAL_USERS.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        return {
          ...u,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    this.products = initialProducts.map((p, idx) => ({
      _id: '64b00000000000000000' + (idx + 1).toString().padStart(4, '0'),
      id: p.id || 'prod-' + (idx + 1),
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.orders = [];
  }

  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = String(email).trim().toLowerCase();
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1', [cleanEmail]);
        if (rows && rows.length > 0) return rows[0];
      } catch (e) {
        console.error('MySQL findUserByEmail error:', e.message);
      }
    }
    return this.users.find((u) => String(u.email || '').trim().toLowerCase() === cleanEmail) || null;
  }

  async findUserById(id) {
    if (!id) return null;
    const idStr = String(id);
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ? OR _id = ? LIMIT 1', [idStr, idStr]);
        if (rows && rows.length > 0) return rows[0];
      } catch (e) {
        console.error('MySQL findUserById error:', e.message);
      }
    }
    return this.users.find((u) => u.id === idStr || u._id === idStr || String(u._id) === idStr) || null;
  }

  async getAllUsers() {
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
      } catch (e) {
        console.error('MySQL getAllUsers error:', e.message);
      }
    }
    return [...this.users];
  }

  async createUser(userData) {
    let hashedPassword = userData.password;
    if (!userData.password.startsWith('$2a$') && !userData.password.startsWith('$2b$')) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }

    const newUser = {
      _id: '64a00000000000000000' + Date.now().toString().slice(-4),
      id: userData.id || 'user-' + Date.now(),
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        await pool.query(
          'INSERT INTO users (id, _id, name, email, password, role, farmName, farmLocation, address, city, district, state, pincode, latitude, longitude, phone, verified, avatar, experienceYears, hectares, vehicleType, serviceArea, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newUser.id,
            newUser._id,
            newUser.name,
            newUser.email.toLowerCase(),
            newUser.password,
            newUser.role || 'buyer',
            newUser.farmName || '',
            newUser.farmLocation || '',
            newUser.address || '',
            newUser.city || 'Coimbatore',
            newUser.district || '',
            newUser.state || 'Tamil Nadu',
            newUser.pincode || '',
            newUser.latitude || null,
            newUser.longitude || null,
            newUser.phone || '',
            newUser.verified ? 1 : 0,
            newUser.avatar || '',
            newUser.experienceYears || 0,
            newUser.hectares || 0,
            newUser.vehicleType || '',
            newUser.serviceArea || '',
            newUser.region || '',
          ]
        );
        return newUser;
      } catch (e) {
        console.error('MySQL createUser error:', e.message);
      }
    }

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, updateData) {
    if (!id) return null;
    const idStr = String(id);
    const updatedAt = new Date().toISOString();

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const setClauses = [];
        const values = [];

        for (const [key, val] of Object.entries(updateData)) {
          if (key === 'id' || key === '_id') continue;
          setClauses.push(`\`${key}\` = ?`);
          values.push(val);
        }

        if (setClauses.length > 0) {
          values.push(idStr, idStr);
          await pool.query(
            `UPDATE users SET ${setClauses.join(', ')} WHERE id = ? OR _id = ?`,
            values
          );
        }
        return await this.findUserById(idStr);
      } catch (e) {
        console.error('MySQL updateUser error:', e.message);
      }
    }

    const index = this.users.findIndex((u) => u.id === idStr || u._id === idStr || String(u._id) === idStr);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updateData, updatedAt };
      return this.users[index];
    }
    return null;
  }

  async getAllProducts() {
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        if (rows && rows.length > 0) {
          return rows.map((r) => {
            const org = Boolean(r.is_organic ?? r.isOrganic);
            return {
              ...r,
              price: parseFloat(r.price) || 0,
              stock: parseInt(r.stock, 10) || 0,
              rating: parseFloat(r.rating) || 5.0,
              isOrganic: org,
              is_organic: org,
            };
          });
        }
      } catch (e) {
        console.error('MySQL getAllProducts error:', e.message);
      }
    }
    return this.products.map((p) => {
      const org = Boolean(p.is_organic ?? p.isOrganic);
      return {
        ...p,
        price: parseFloat(p.price) || 0,
        stock: parseInt(p.stock, 10) || 0,
        rating: parseFloat(p.rating) || 5.0,
        isOrganic: org,
        is_organic: org,
      };
    });
  }

  async getProductsByFarmer(farmerId) {
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM products WHERE farmerId = ? OR _id = ?', [String(farmerId), String(farmerId)]);
        if (rows && rows.length > 0) {
          return rows.map((r) => {
            const org = Boolean(r.is_organic ?? r.isOrganic);
            return {
              ...r,
              price: parseFloat(r.price) || 0,
              stock: parseInt(r.stock, 10) || 0,
              rating: parseFloat(r.rating) || 5.0,
              isOrganic: org,
              is_organic: org,
            };
          });
        }
      } catch (e) {
        console.error('MySQL getProductsByFarmer error:', e.message);
      }
    }
    return this.products
      .filter((p) => p.farmerId === farmerId || p.farmer === farmerId || String(p.farmer) === String(farmerId))
      .map((p) => {
        const org = Boolean(p.is_organic ?? p.isOrganic);
        return { ...p, isOrganic: org, is_organic: org };
      });
  }

  async createProduct(productData) {
    const isOrganicVal = productData.is_organic !== undefined 
      ? Boolean(productData.is_organic) 
      : (productData.isOrganic !== undefined ? Boolean(productData.isOrganic) : true);

    const newProduct = {
      _id: '64b00000000000000000' + Date.now().toString().slice(-4),
      id: productData.id || 'prod-' + Date.now(),
      ...productData,
      isOrganic: isOrganicVal,
      is_organic: isOrganicVal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        await pool.query(
          'INSERT INTO products (id, _id, name, category, subCategory, price, unit, stock, rating, reviewsCount, isOrganic, is_organic, harvestDate, farmerId, farmerName, farmLocation, description, image, featured, badge, city, district, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newProduct.id,
            newProduct._id,
            newProduct.name,
            newProduct.category,
            newProduct.subCategory || '',
            Number(newProduct.price) || 0,
            newProduct.unit || 'kg',
            Number(newProduct.stock) || 0,
            Number(newProduct.rating) || 5.0,
            Number(newProduct.reviewsCount) || 0,
            newProduct.isOrganic ? 1 : 0,
            newProduct.is_organic ? 1 : 0,
            newProduct.harvestDate || '',
            newProduct.farmerId || 'farmer-1',
            newProduct.farmerName || 'Local Farm',
            newProduct.farmLocation || '',
            newProduct.description || '',
            newProduct.image || '',
            newProduct.featured ? 1 : 0,
            newProduct.badge || '',
            newProduct.city || '',
            newProduct.district || '',
            newProduct.latitude || null,
            newProduct.longitude || null,
          ]
        );
        return newProduct;
      } catch (e) {
        console.error('MySQL createProduct error:', e.message);
      }
    }

    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id, updates) {
    const finalUpdates = { ...updates };
    if (finalUpdates.is_organic !== undefined) {
      finalUpdates.isOrganic = Boolean(finalUpdates.is_organic);
      finalUpdates.is_organic = Boolean(finalUpdates.is_organic);
    } else if (finalUpdates.isOrganic !== undefined) {
      finalUpdates.is_organic = Boolean(finalUpdates.isOrganic);
      finalUpdates.isOrganic = Boolean(finalUpdates.isOrganic);
    }

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const fields = [];
        const values = [];
        for (const [k, v] of Object.entries(finalUpdates)) {
          fields.push('`' + k + '` = ?');
          values.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
        }
        if (fields.length > 0) {
          values.push(String(id), String(id));
          await pool.query('UPDATE products SET ' + fields.join(', ') + ' WHERE id = ? OR _id = ?', values);
          const [rows] = await pool.query('SELECT * FROM products WHERE id = ? OR _id = ? LIMIT 1', [String(id), String(id)]);
          if (rows && rows.length > 0) {
            const org = Boolean(rows[0].is_organic ?? rows[0].isOrganic);
            return { ...rows[0], isOrganic: org, is_organic: org };
          }
        }
      } catch (e) {
        console.error('MySQL updateProduct error:', e.message);
      }
    }

    const idx = this.products.findIndex((p) => p.id === id || p._id === id || String(p._id) === String(id));
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...finalUpdates, updatedAt: new Date().toISOString() };
      return this.products[idx];
    }
    return null;
  }

  async deleteProduct(id) {
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        await pool.query('DELETE FROM products WHERE id = ? OR _id = ?', [String(id), String(id)]);
      } catch (e) {
        console.error('MySQL deleteProduct error:', e.message);
      }
    }

    this.products = this.products.filter((p) => p.id !== id && p._id !== id && String(p._id) !== String(id));
    return true;
  }

  async recordProductView(userId, productId) {
    if (!userId || !productId) return false;
    const uidStr = String(userId);
    const pidStr = String(productId);

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        // 1. Validate that the product exists in the actual MySQL products table
        const [prodRows] = await pool.query(
          'SELECT id FROM products WHERE id = ? OR _id = ? LIMIT 1',
          [pidStr, pidStr]
        );
        if (!prodRows || prodRows.length === 0) {
          return false;
        }
        const canonicalId = prodRows[0].id;

        // 2. Insert or update timestamp to move it to the latest position without duplicates
        await pool.query(
          'INSERT INTO recently_viewed (userId, productId, viewedAt) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE viewedAt = NOW()',
          [uidStr, canonicalId]
        );
        return true;
      } catch (e) {
        console.error('MySQL recordProductView error:', e.message);
      }
    }

    if (!this.recentlyViewed) this.recentlyViewed = [];
    const prodExists = this.products.some((p) => p.id === pidStr || p._id === pidStr);
    if (!prodExists) return false;

    const idx = this.recentlyViewed.findIndex((r) => r.userId === uidStr && r.productId === pidStr);
    if (idx !== -1) {
      this.recentlyViewed[idx].viewedAt = new Date().toISOString();
    } else {
      this.recentlyViewed.push({ userId: uidStr, productId: pidStr, viewedAt: new Date().toISOString() });
    }
    return true;
  }

  async getRecentlyViewedProducts(userId, limit = 8) {
    if (!userId) return [];
    const uidStr = String(userId);
    const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();

        // 1. Automatic cleanup of any orphaned records where product was deleted
        await pool.query(
          'DELETE rv FROM recently_viewed rv LEFT JOIN products p ON (rv.productId = p.id OR rv.productId = p._id) WHERE p.id IS NULL'
        ).catch(() => {});

        // 2. Fetch active products viewed by this user, ordered by latest viewedAt first
        const [rows] = await pool.query(
          `SELECT p.*, rv.viewedAt 
           FROM recently_viewed rv 
           JOIN products p ON (rv.productId = p.id OR rv.productId = p._id) 
           WHERE rv.userId = ? 
           ORDER BY rv.viewedAt DESC 
           LIMIT ?`,
          [uidStr, safeLimit]
        );

        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            price: parseFloat(r.price) || 0,
            stock: parseInt(r.stock, 10) || 0,
            rating: parseFloat(r.rating) || 5.0,
            reviewsCount: parseInt(r.reviewsCount, 10) || 0,
            isOrganic: Boolean(r.is_organic ?? r.isOrganic),
            is_organic: Boolean(r.is_organic ?? r.isOrganic),
          }));
        }
        return [];
      } catch (e) {
        console.error('MySQL getRecentlyViewedProducts error:', e.message);
      }
    }

    if (!this.recentlyViewed) return [];
    const userViews = this.recentlyViewed
      .filter((r) => r.userId === uidStr)
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
      .slice(0, limit);

    return userViews
      .map((v) => this.products.find((p) => p.id === v.productId || p._id === v.productId))
      .filter(Boolean);
  }

  async getOrdersByBuyer(buyerId, user = null) {
    if (!buyerId) return [];
    const buyerIdStr = String(buyerId);
    const userName = user?.name ? String(user.name).trim() : '';

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query(
          'SELECT * FROM orders WHERE buyerId = ? OR _id = ? OR (? != "" AND buyerName != "" AND (LOWER(buyerName) = LOWER(?) OR LOWER(?) LIKE CONCAT("%", LOWER(buyerName), "%"))) ORDER BY created_at DESC',
          [buyerIdStr, buyerIdStr, userName, userName, userName]
        );
        return rows.map((r) => ({
          ...r,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          buyerLocation: typeof r.buyerLocation === 'string' ? JSON.parse(r.buyerLocation) : (r.buyerLocation || null),
          assignedDeliveryPartner: typeof r.assignedDeliveryPartner === 'string' ? JSON.parse(r.assignedDeliveryPartner) : (r.assignedDeliveryPartner || null),
          timestamps: typeof r.timestamps === 'string' ? JSON.parse(r.timestamps) : (r.timestamps || {}),
          trackingSteps: typeof r.trackingSteps === 'string' ? JSON.parse(r.trackingSteps) : (r.trackingSteps || []),
        }));
      } catch (e) {
        console.error('MySQL getOrdersByBuyer error:', e.message);
      }
    }

    return this.orders
      .filter((o) => {
        const oBuyerId = String(o.buyerId || '');
        const oBuyer = typeof o.buyer === 'object' && o.buyer !== null
          ? String(o.buyer._id || o.buyer.id || '')
          : String(o.buyer || '');
        return oBuyerId === buyerIdStr || oBuyer === buyerIdStr;
      })
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  async getOrdersByFarmer(farmerId, user = null) {
    let farmer = user;
    if (!farmer || !farmer.city) {
      farmer = await this.findUserById(farmerId);
    }
    if (!farmer) {
      farmer = { id: farmerId, _id: farmerId, city: 'Kovilpatti' };
    }

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        const parsedOrders = rows.map((r) => ({
          ...r,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          buyerLocation: typeof r.buyerLocation === 'string' ? JSON.parse(r.buyerLocation) : (r.buyerLocation || null),
          assignedDeliveryPartner: typeof r.assignedDeliveryPartner === 'string' ? JSON.parse(r.assignedDeliveryPartner) : (r.assignedDeliveryPartner || null),
          timestamps: typeof r.timestamps === 'string' ? JSON.parse(r.timestamps) : (r.timestamps || {}),
          trackingSteps: typeof r.trackingSteps === 'string' ? JSON.parse(r.trackingSteps) : (r.trackingSteps || []),
        }));

        return parsedOrders.filter((o) => isFarmerOrderLocationMatch(farmer, o));
      } catch (e) {
        console.error('MySQL getOrdersByFarmer error:', e.message);
      }
    }

    return this.orders
      .filter((o) => isFarmerOrderLocationMatch(farmer, o))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  async getOrdersByDeliveryPartner(partnerId, user = null) {
    let partner = user;
    if (!partner || !partner.city || !partner.serviceArea) {
      const dbUser = await this.findUserById(partnerId);
      if (dbUser) {
        partner = { ...dbUser, ...(user || {}) };
      }
    }
    if (!partner) {
      partner = { id: partnerId, _id: partnerId, city: 'Coimbatore', serviceArea: 'Coimbatore Hub' };
    }

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query(
          "SELECT * FROM orders WHERE status IN ('Ready for Pickup', 'Accepted', 'Processing', 'Picked Up', 'Out for Delivery', 'Delivered') ORDER BY created_at DESC"
        );

        const parsedOrders = rows.map((r) => ({
          ...r,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          buyerLocation: typeof r.buyerLocation === 'string' ? JSON.parse(r.buyerLocation) : (r.buyerLocation || null),
          assignedDeliveryPartner: typeof r.assignedDeliveryPartner === 'string' ? JSON.parse(r.assignedDeliveryPartner) : (r.assignedDeliveryPartner || null),
          timestamps: typeof r.timestamps === 'string' ? JSON.parse(r.timestamps) : (r.timestamps || {}),
          trackingSteps: typeof r.trackingSteps === 'string' ? JSON.parse(r.trackingSteps) : (r.trackingSteps || []),
        }));

        return parsedOrders.filter((o) => isDeliveryPartnerLocationMatch(partner, o));
      } catch (e) {
        console.error('MySQL getOrdersByDeliveryPartner error:', e.message);
      }
    }

    return this.orders
      .filter((o) => isDeliveryPartnerLocationMatch(partner, o))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  async getAllOrders() {
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        return rows.map((r) => ({
          ...r,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          buyerLocation: typeof r.buyerLocation === 'string' ? JSON.parse(r.buyerLocation) : (r.buyerLocation || null),
          assignedDeliveryPartner: typeof r.assignedDeliveryPartner === 'string' ? JSON.parse(r.assignedDeliveryPartner) : (r.assignedDeliveryPartner || null),
          timestamps: typeof r.timestamps === 'string' ? JSON.parse(r.timestamps) : (r.timestamps || {}),
          trackingSteps: typeof r.trackingSteps === 'string' ? JSON.parse(r.trackingSteps) : (r.trackingSteps || []),
        }));
      } catch (e) {
        console.error('MySQL getAllOrders error:', e.message);
      }
    }
    return [...this.orders].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  async getOrderById(id) {
    const idStr = String(id);
    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR _id = ? LIMIT 1', [idStr, idStr]);
        if (rows && rows.length > 0) {
          const r = rows[0];
          return {
            ...r,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
            buyerLocation: typeof r.buyerLocation === 'string' ? JSON.parse(r.buyerLocation) : (r.buyerLocation || null),
            assignedDeliveryPartner: typeof r.assignedDeliveryPartner === 'string' ? JSON.parse(r.assignedDeliveryPartner) : (r.assignedDeliveryPartner || null),
            timestamps: typeof r.timestamps === 'string' ? JSON.parse(r.timestamps) : (r.timestamps || {}),
            trackingSteps: typeof r.trackingSteps === 'string' ? JSON.parse(r.trackingSteps) : (r.trackingSteps || []),
          };
        }
      } catch (e) {
        console.error('MySQL getOrderById error:', e.message);
      }
    }
    return this.orders.find((o) => o.id === id || o._id === id || String(o._id) === idStr) || null;
  }

  async findOrderById(id) {
    return this.getOrderById(id);
  }

  async createOrder(orderData) {
    const primaryFarmerId = orderData.farmerId || orderData.items?.[0]?.farmerId || 'farmer-1';
    const primaryFarmerName = orderData.farmerName || orderData.items?.[0]?.farmerName || 'Local Farm';

    const newOrder = {
      _id: orderData._id || '64c00000000000000000' + Date.now().toString().slice(-4),
      id: orderData.id || 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: orderData.date || new Date().toISOString().split('T')[0],
      farmerId: primaryFarmerId,
      farmerName: primaryFarmerName,
      status: orderData.status || 'Pending',
      deliveryEarnings: orderData.deliveryEarnings || (50 + Math.round((Number(orderData.farmDistanceKm) || 5) * 2)),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        await pool.query(
          'INSERT INTO orders (id, _id, date, buyerId, buyerName, buyerPhone, deliveryCity, deliveryAddress, buyerLocation, farmerId, farmerName, farmLocation, farmDistanceKm, items, subtotal, deliveryFee, total, paymentMethod, paymentStatus, deliveryEarnings, status, estimatedDelivery, assignedDeliveryPartner, timestamps, trackingSteps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newOrder.id,
            newOrder._id,
            newOrder.date,
            newOrder.buyerId,
            newOrder.buyerName,
            newOrder.buyerPhone || '',
            newOrder.deliveryCity || 'Coimbatore',
            newOrder.deliveryAddress,
            JSON.stringify(newOrder.buyerLocation || null),
            newOrder.farmerId,
            newOrder.farmerName,
            newOrder.farmLocation || '',
            Number(newOrder.farmDistanceKm) || 0,
            JSON.stringify(newOrder.items || []),
            Number(newOrder.subtotal) || 0,
            Number(newOrder.deliveryFee) || 0,
            Number(newOrder.total) || 0,
            newOrder.paymentMethod || 'UPI / QR Payment',
            newOrder.paymentStatus || 'Paid',
            Number(newOrder.deliveryEarnings) || 50,
            newOrder.status || 'Pending',
            newOrder.estimatedDelivery || '',
            JSON.stringify(newOrder.assignedDeliveryPartner || null),
            JSON.stringify(newOrder.timestamps || {}),
            JSON.stringify(newOrder.trackingSteps || []),
          ]
        );
        return newOrder;
      } catch (e) {
        console.error('MySQL createOrder error:', e.message);
      }
    }

    this.orders.unshift(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id, status, assignedPartner = null) {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    if (getIsMySQLConnected()) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR _id = ? LIMIT 1', [String(id), String(id)]);
        if (rows && rows.length > 0) {
          const ord = rows[0];
          const currentTimestamps = typeof ord.timestamps === 'string' ? JSON.parse(ord.timestamps) : (ord.timestamps || {});
          const statusKey = status.toLowerCase().replace(/ /g, '_');
          currentTimestamps[statusKey] = new Date().toISOString().split('T')[0] + ', ' + nowStr;

          let finalAssignedPartner = assignedPartner || (typeof ord.assignedDeliveryPartner === 'string' ? JSON.parse(ord.assignedDeliveryPartner) : ord.assignedDeliveryPartner);

          await pool.query(
            'UPDATE orders SET status = ?, assignedDeliveryPartner = ?, timestamps = ? WHERE id = ? OR _id = ?',
            [
              status,
              JSON.stringify(finalAssignedPartner || null),
              JSON.stringify(currentTimestamps),
              String(id),
              String(id),
            ]
          );

          const [updatedRows] = await pool.query('SELECT * FROM orders WHERE id = ? OR _id = ? LIMIT 1', [String(id), String(id)]);
          if (updatedRows && updatedRows.length > 0) {
            const r = updatedRows[0];
            return {
              ...r,
              items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
              buyerLocation: typeof r.buyerLocation === 'string' ? JSON.parse(r.buyerLocation) : (r.buyerLocation || null),
              assignedDeliveryPartner: typeof r.assignedDeliveryPartner === 'string' ? JSON.parse(r.assignedDeliveryPartner) : (r.assignedDeliveryPartner || null),
              timestamps: typeof r.timestamps === 'string' ? JSON.parse(r.timestamps) : (r.timestamps || {}),
              trackingSteps: typeof r.trackingSteps === 'string' ? JSON.parse(r.trackingSteps) : (r.trackingSteps || []),
            };
          }
        }
      } catch (e) {
        console.error('MySQL updateOrderStatus error:', e.message);
      }
    }

    const idx = this.orders.findIndex((o) => o.id === id || o._id === id || String(o._id) === String(id));
    if (idx !== -1) {
      const order = this.orders[idx];
      order.status = status;
      if (assignedPartner) order.assignedDeliveryPartner = assignedPartner;
      if (!order.timestamps) order.timestamps = {};
      const statusKey = status.toLowerCase().replace(/ /g, '_');
      order.timestamps[statusKey] = new Date().toISOString().split('T')[0] + ', ' + nowStr;
      if (!order.deliveryEarnings) {
        order.deliveryEarnings = 50 + Math.round((Number(order.farmDistanceKm) || 5) * 2);
      }
      this.orders[idx] = { ...order, updatedAt: nowIso };
      return this.orders[idx];
    }
    return null;
  }
}

export const dbStore = new DataStore();
