import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = req.params.folder || 'products';
    const dir = path.join(uploadDir, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|avif/;
  const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const okMime = allowed.test(file.mimetype);
  if (okExt && okMime) cb(null, true);
  else cb(new Error('Only JPG, PNG, WebP, GIF and AVIF images are allowed.'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_UPLOAD) || 5 * 1024 * 1024 },
});
