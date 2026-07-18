import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ message: 'Category created.', category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category updated.', category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};
