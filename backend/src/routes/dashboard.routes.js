import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getStats,
  getSalesChart,
  getTopProducts,
  getCategoryBreakdown,
  getRecentOrders,
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/sales', getSalesChart);
router.get('/top-products', getTopProducts);
router.get('/categories', getCategoryBreakdown);
router.get('/recent-orders', getRecentOrders);

export default router;
