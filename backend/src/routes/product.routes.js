import express from 'express';
import { protect, admin } from '../middleware/validate-user-roles.js';
import {
  getProducts,
  getProduct,
  getRelated,
  getFeatured,
  getLatest,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getBrands,
} from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const createRules = [
  body('title').trim().isLength({ min: 3, max: 160 }),
  body('description').isLength({ min: 20 }),
  body('price').isFloat({ min: 0 }),
  body('category').notEmpty(),
  body('brand').notEmpty(),
  body('sku').notEmpty(),
];

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/latest', getLatest);
router.get('/brands', getBrands);
router.get('/:slug', getProduct);
router.get('/:slug/related', getRelated);

router.post('/', protect, admin, createRules, validate, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/stock', protect, admin, adjustStock);

export default router;
