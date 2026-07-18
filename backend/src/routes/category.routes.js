import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
