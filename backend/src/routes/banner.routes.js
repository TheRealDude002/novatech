import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller.js';

const router = express.Router();

router.get('/', getBanners);
router.get('/all', protect, admin, getAllBanners);
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

export default router;
