import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const seedDatabase = async () => {
  try {
    // 1. Seed Users if empty or missing demo users
    for (const u of INITIAL_USERS) {
      const exists = await User.findOne({ email: u.email.toLowerCase() });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({
          ...u,
          password: hashedPassword,
        });
      }
    }
    console.log('✅ Demo users verified in MongoDB Atlas.');

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const rawProducts = fs.readFileSync(
        path.join(__dirname, '..', '..', 'src', 'data', 'products.json'),
        'utf-8'
      );
      const parsedProducts = JSON.parse(rawProducts);

      const formatted = parsedProducts.map((p, idx) => ({
        _id: `64b00000000000000000${(idx + 1).toString().padStart(4, '0')}`,
        id: p.id || `prod-${idx + 1}`,
        name: p.name,
        category: p.category,
        subCategory: p.subCategory || '',
        price: Number(p.price) || 1,
        unit: p.unit || 'kg',
        stock: Number(p.stock) || 100,
        rating: Number(p.rating) || 5.0,
        reviewsCount: Number(p.reviewsCount) || 1,
        isOrganic: Boolean(p.isOrganic !== false),
        harvestDate: p.harvestDate || new Date().toISOString().split('T')[0],
        farmerId: p.farmerId || 'farmer-1',
        farmerName: p.farmerName || 'Selvam Organic Farms',
        farmLocation: p.farmLocation || 'Coimbatore, Tamil Nadu',
        description: p.description || '',
        image: p.image || '',
        featured: Boolean(p.featured),
        badge: p.badge || '',
        city: p.city || 'Coimbatore',
        district: p.district || 'Coimbatore',
        latitude: Number(p.latitude || p.lat) || 11.0168,
        longitude: Number(p.longitude || p.lng) || 76.9558,
      }));

      await Product.insertMany(formatted);
      console.log(`✅ Seeded ${formatted.length} products into MongoDB Atlas.`);
    } else {
      console.log(`✅ MongoDB Atlas already has ${productCount} products.`);
    }
  } catch (err) {
    console.warn('⚠️  Database seeding notice:', err.message);
  }
};
