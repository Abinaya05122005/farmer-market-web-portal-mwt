import express from 'express';
import {
  getProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMarketRates,
  syncMarketPricesHandler,
  recordProductViewHandler,
  getRecentlyViewedHandler,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/market-rates', getMarketRates);
router.post('/sync-market-prices', syncMarketPricesHandler);
router.get('/recently-viewed', protect, getRecentlyViewedHandler);
router.post('/:id/view', protect, recordProductViewHandler);
router.get('/farmer', protect, authorize('farmer', 'admin'), getMyProducts);
router.post('/', protect, authorize('farmer'), createProduct);
router.put('/:id', protect, authorize('farmer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);

export default router;
