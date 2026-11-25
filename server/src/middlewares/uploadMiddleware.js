import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoUploadDir = path.join(__dirname, '../../uploads/videos');
const thumbnailUploadDir = path.join(__dirname, '../../uploads/thumbnails');

// Ensure directories exist
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(thumbnailUploadDir)) {
  fs.mkdirSync(thumbnailUploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, videoUploadDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailUploadDir);
    } else {
      cb(new ApiError(400, `Unexpected upload field: ${file.fieldname}`), null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File Filter Function
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const isMp4 =
      file.mimetype === 'video/mp4' ||
      path.extname(file.originalname).toLowerCase() === '.mp4';

    if (isMp4) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid video format. Only MP4 (.mp4) videos are permitted.'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    const validImageTypes = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isMimeValid = validImageTypes.test(file.mimetype);
    const isExtValid = validImageTypes.test(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid thumbnail format. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  } else {
    cb(new ApiError(400, `Unsupported upload field: ${file.fieldname}`), false);
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB max video limit
  }
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);
