import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, trim: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    shortDescription: { type: String, maxlength: 200 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: { type: String, required: true, trim: true },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v === undefined || v < this.price;
        },
        message: 'Sale price must be less than regular price',
      },
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [{ type: String }],
    colors: [{ name: String, hex: String }],
    specifications: [specSchema],
    warranty: { type: String, default: '12 months' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    weight: { type: Number, default: 0 }, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug =
      this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' +
      (this.sku || Date.now().toString().slice(-6));
  }
  next();
});

productSchema.virtual('discountPercent').get(function () {
  if (this.salePrice && this.salePrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewsCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewsCount = this.reviews.length;
  }
};

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
