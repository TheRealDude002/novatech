import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images rating reviewsCount brand sku isActive',
    });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }
    res.json({ wishlist });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    const exists = wishlist.items.find((i) => String(i.product) === req.params.id);
    if (exists) return res.json({ message: 'Already in your wishlist.', wishlist });
    wishlist.items.push({ product: req.params.id });
    await wishlist.save();
    res.status(201).json({ message: 'Saved to wishlist.', wishlist });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found.' });
    wishlist.items = wishlist.items.filter((i) => String(i.product) !== req.params.id);
    await wishlist.save();
    res.json({ message: 'Removed from wishlist.', wishlist });
  } catch (err) {
    next(err);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }
    res.json({ message: 'Wishlist cleared.' });
  } catch (err) {
    next(err);
  }
};
