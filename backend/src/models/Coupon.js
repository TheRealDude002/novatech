import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrder: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

export default mongoose.model('Coupon', couponSchema);
