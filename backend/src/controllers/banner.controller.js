import Banner from '../models/Banner.js';

export const getBanners = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.placement) filter.placement = req.query.placement;
    const now = new Date();
    filter.$and = [
      {
        $or: [{ startAt: { $exists: false } }, { startAt: null }, { startAt: { $lte: now } }],
      },
      {
        $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now } }],
      },
    ];
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ placement: 1, position: 1 });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ message: 'Banner created.', banner });
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json({ message: 'Banner updated.', banner });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json({ message: 'Banner deleted.' });
  } catch (err) {
    next(err);
  }
};
