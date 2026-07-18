import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: String, required: true },
    mobileImage: { type: String, default: '' },
    ctaText: { type: String, default: 'Shop now' },
    ctaLink: { type: String, default: '/shop' },
    placement: {
      type: String,
      enum: ['hero', 'midpage', 'sidebar', 'footer', 'promo'],
      default: 'hero',
    },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startAt: { type: Date },
    endAt: { type: Date },
    bg: { type: String, default: '#0B0F1A' },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
