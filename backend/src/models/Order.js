import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String, default: '' },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: 'Nigeria' },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash_on_delivery', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    reference: { type: String, default: '' },
    paidAt: { type: Date },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    payment: paymentSchema,
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    notes: { type: String, trim: true, maxlength: 500 },
    timeline: [
      {
        status: { type: String },
        at: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const stamp = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `NT-${stamp}${rand}`;
  }
  if (this.status && this.isNew) {
    this.timeline = [{ status: this.status, at: new Date(), note: 'Order placed' }];
  }
  next();
});

export default mongoose.model('Order', orderSchema);
