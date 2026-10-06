import express from 'express';
import {
  getMyOrders,
  getFarmerOrders,
  getDeliveryOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  downloadOrderReceipt,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Specific role-isolated endpoints
router.get('/my-orders', protect, authorize('buyer', 'admin'), getMyOrders);
router.get('/farmer-orders', protect, authorize('farmer', 'admin'), getFarmerOrders);
router.get('/delivery-orders', protect, authorize('delivery', 'admin'), getDeliveryOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);

// General Order endpoints
router.post('/', createOrder);
router.get('/:id/receipt', protect, downloadOrderReceipt);
router.get('/:id', getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
