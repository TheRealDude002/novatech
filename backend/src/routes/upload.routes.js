import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please choose an image to upload.' });
  const url = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
  res.status(201).json({ message: 'Image uploaded.', url, filename: req.file.filename });
});

router.post('/multiple', protect, admin, upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Please choose at least one image.' });
  }
  const urls = req.files.map((f) => ({
    url: `${req.protocol}://${req.get('host')}/uploads/products/${f.filename}`,
    filename: f.filename,
  }));
  res.status(201).json({ message: 'Images uploaded.', files: urls });
});

router.post('/:folder', protect, admin, upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Please choose at least one image.' });
  }
  const urls = req.files.map((f) => ({
    url: `${req.protocol}://${req.get('host')}/uploads/${req.params.folder}/${f.filename}`,
    filename: f.filename,
  }));
  res.status(201).json({ message: 'Images uploaded.', files: urls });
});

export default router;
