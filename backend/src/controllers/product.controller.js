import Product from '../models/Product.js';
import { paginate } from '../utils/helpers.js';

const buildQuery = (req) => {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    featured,
    onSale,
    inStock,
    sort,
  } = req.query;

  const filter = { isActive: true };

  if (q) {
    const rx = new RegExp(q.trim().split(/\s+/).join('|'), 'i');
    filter.$or = [
      { title: rx },
      { description: rx },
      { brand: rx },
      { sku: rx },
      { tags: rx },
    ];
  }

  if (category) {
    if (/^[0-9a-fA-F]{24}$/.test(category)) filter.category = category;
    else filter['category.slug'] = category; // rarely used, fall back handled in controller
  }
  if (brand) {
    const brands = String(brand).split(',').map((b) => b.trim()).filter(Boolean);
    if (brands.length) filter.brand = { $in: brands };
  }
  if (minPrice || maxPrice) {
    filter.$and = filter.$and || [];
    if (minPrice) filter.$and.push({ price: { $gte: Number(minPrice) } });
    if (maxPrice) filter.$and.push({ price: { $lte: Number(maxPrice) } });
  }
  if (rating) {
    filter.rating = { $gte: Number(rating) };
  }
  if (featured === 'true') filter.isFeatured = true;
  if (onSale === 'true') filter.salePrice = { $ne: null, $gt: 0 };
  if (inStock === 'true') filter.stock = { $gt: 0 };

  return filter;
};

const sortMap = {
  popular: { soldCount: -1, rating: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  newest: { createdAt: -1 },
  rating: { rating: -1 },
  'name-asc': { title: 1 },
  'name-desc': { title: -1 },
};

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    let filter = buildQuery(req);

    // Resolve category slug to ObjectId if needed
    if (req.query.category && !/^[0-9a-fA-F]{24}$/.test(req.query.category)) {
      const Category = (await import('../models/Category.js')).default;
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) {
        delete filter['category.slug'];
        filter.category = cat._id;
      } else {
        filter.category = null;
      }
    }

    const sort = sortMap[req.query.sort] || sortMap.popular;
    const [items, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products: items,
      page,
      pages: Math.ceil(total / limit),
      total,
      count: items.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ slug: req.params.slug }, { sku: req.params.slug.toUpperCase() }],
      isActive: true,
    }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'We could not find that product.' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const getRelated = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'We could not find that product.' });
    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .limit(6)
      .sort({ soldCount: -1, rating: -1 });
    res.json({ products: related });
  } catch (err) {
    next(err);
  }
};

export const getFeatured = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true, isActive: true })
      .sort({ rating: -1, soldCount: -1 })
      .limit(limit);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

export const getLatest = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created.', product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product updated.', product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { adjustment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    product.stock = Math.max(0, product.stock + Number(adjustment));
    await product.save();
    res.json({ message: 'Stock updated.', stock: product.stock });
  } catch (err) {
    next(err);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ brands: brands.sort() });
  } catch (err) {
    next(err);
  }
};
