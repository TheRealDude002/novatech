import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId, isApproved: true }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You already reviewed this product. Edit your existing review instead.' });
    }

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      name: req.user.name,
      rating,
      title,
      comment,
    });

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      title,
      comment,
    });
    product.updateRating();
    await product.save();

    res.status(201).json({ message: 'Review posted. Thanks for sharing your experience.', review });
  } catch (err) {
    next(err);
  }
};

export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Marked as helpful.', helpful: review.helpful });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }
    await review.deleteOne();
    const product = await Product.findById(review.product);
    if (product) {
      product.reviews = product.reviews.filter((r) => String(r.user) !== String(review.user));
      product.updateRating();
      await product.save();
    }
    res.json({ message: 'Review removed.' });
  } catch (err) {
    next(err);
  }
};
