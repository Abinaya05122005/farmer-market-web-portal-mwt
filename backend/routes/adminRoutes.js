import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboardOverview,
  getAdminUsers,
  getAdminProducts,
  getAdminOrders,
  getAdminRecentActivity,
  deleteAdminProduct,
  deleteAdminUser,
  updateAdminOrderStatus,
} from '../controllers/adminController.js';

const router = express.Router();

// Strict security: ALL Admin routes require valid JWT token AND role === 'admin'
router.use(protect);
router.use(authorize('admin'));

// 1. Dashboard Overview Metrics & Analytics
router.get('/dashboard', getDashboardOverview);

// 2. User Management
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);

// 3. Product Catalog Management
router.get('/products', getAdminProducts);
router.delete('/products/:id', deleteAdminProduct);

// 4. Order & Logistics Fulfillment Management
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateAdminOrderStatus);

// 5. System Activity Streams
router.get('/recent-activity', getAdminRecentActivity);

export default router;
