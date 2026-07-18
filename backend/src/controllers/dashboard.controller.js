import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

export const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [totalOrders, totalProducts, totalUsers, totalCategories, monthRevenue, lastMonthRevenue, lowStock] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'customer' }),
        Category.countDocuments(),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
              status: { $ne: 'cancelled' },
            },
          },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      ]);

    const monthTotal = monthRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth =
      lastMonthTotal === 0 ? (monthTotal > 0 ? 100 : 0) : Math.round(((monthTotal - lastMonthTotal) / lastMonthTotal) * 100);

    res.json({
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalCategories,
        monthRevenue: monthTotal,
        revenueGrowth,
        lowStock,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getSalesChart = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const products = await Product.find({ isActive: true })
      .sort({ soldCount: -1, rating: -1 })
      .limit(limit)
      .select('title sku price salePrice soldCount stock images brand');
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const data = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: { $multiply: ['$price', '$soldCount'] } } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', slug: '$category.slug', count: 1, revenue: 1 } },
      { $sort: { revenue: -1 } },
    ]);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .select('orderNumber total status createdAt user');
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};
