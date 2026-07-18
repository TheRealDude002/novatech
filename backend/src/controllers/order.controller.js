import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'cash_on_delivery',
      shippingCost = 0,
      tax = 0,
      couponCode = '',
      notes = '',
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Validate products and compute subtotal
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const map = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = map.get(String(i.product));
      if (!p) throw Object.assign(new Error('One of the products is no longer available.'), { status: 400 });
      if (p.stock < i.quantity) {
        throw Object.assign(
          new Error(`Only ${p.stock} unit(s) of ${p.title} are in stock.`),
          { status: 400 }
        );
      }
      const unitPrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
      subtotal += unitPrice * i.quantity;
      return {
        product: p._id,
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        image: p.images?.[0] || '',
        price: p.price,
        salePrice: p.salePrice || null,
        quantity: i.quantity,
        color: i.color || '',
      };
    });

    let discount = 0;
    let appliedCoupon = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon || !coupon.isValid()) {
        return res.status(400).json({ message: 'That coupon is invalid or has expired.' });
      }
      if (subtotal < coupon.minOrder) {
        return res.status(400).json({
          message: `This coupon needs a minimum order of ₦${coupon.minOrder.toLocaleString()}.`,
        });
      }
      discount =
        coupon.type === 'percent'
          ? Math.min(
              (subtotal * coupon.value) / 100,
              coupon.maxDiscount || Infinity
            )
          : Math.min(coupon.value, subtotal);
      appliedCoupon = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }

    const total = Math.max(0, subtotal + shippingCost + tax - discount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      payment: { method: paymentMethod, status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending' },
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode: appliedCoupon,
      total,
      notes,
    });

    // Reduce stock and bump sold count
    await Promise.all(
      orderItems.map(async (oi) => {
        await Product.updateOne(
          { _id: oi.product },
          { $inc: { stock: -oi.quantity, soldCount: oi.quantity } }
        );
      })
    );

    res.status(201).json({
      message: 'Order placed. We will reach out to confirm delivery details.',
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);
    res.json({ orders, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.status = status;
    if (note) order.notes = note;
    if (status === 'delivered') order.deliveredAt = new Date();
    order.timeline.push({ status, at: new Date(), note: note || `Status set to ${status}` });
    await order.save();
    res.json({ message: 'Order status updated.', order });
  } catch (err) {
    next(err);
  }
};

export const verifyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ message: 'That coupon is invalid or has expired.' });
    }
    if (subtotal && subtotal < coupon.minOrder) {
      return res.status(400).json({
        message: `This coupon needs a minimum order of ₦${coupon.minOrder.toLocaleString()}.`,
      });
    }
    let discount =
      coupon.type === 'percent'
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    res.json({
      message: 'Coupon applied.',
      code: coupon.code,
      discount,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (err) {
    next(err);
  }
};
