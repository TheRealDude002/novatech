import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', getCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
