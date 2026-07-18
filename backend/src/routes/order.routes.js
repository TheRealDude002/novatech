import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  verifyCoupon,
} from '../controllers/order.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.post('/coupon/verify', verifyCoupon);
router.get('/mine', getMyOrders);
router.get('/:orderNumber', getOrder);

router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

export default router;
