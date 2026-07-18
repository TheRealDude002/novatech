import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images sku isActive brand',
    });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    // Filter out inactive products
    cart.items = cart.items.filter((i) => i.product && i.product.isActive);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { quantity = 1, color = '' } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} unit(s) available.` });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    const existing = cart.items.find((i) => String(i.product) === req.params.id && i.color === color);
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    } else {
      cart.items.push({ product: req.params.id, quantity, color });
    }
    await cart.save();
    const populated = await cart.populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images sku isActive brand',
    });
    res.status(201).json({ message: 'Added to cart.', cart: populated });
  } catch (err) {
    next(err);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images sku isActive brand',
    });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });
    const item = cart.items.find((i) => String(i.product._id) === req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not in your cart.' });
    if (quantity > item.product.stock) {
      return res.status(400).json({ message: `Only ${item.product.stock} unit(s) available.` });
    }
    item.quantity = Math.max(1, quantity);
    await cart.save();
    res.json({ message: 'Quantity updated.', cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });
    cart.items = cart.items.filter((i) => String(i.product) !== req.params.id);
    await cart.save();
    const populated = await cart.populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images sku isActive brand',
    });
    res.json({ message: 'Removed from cart.', cart: populated });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    next(err);
  }
};
