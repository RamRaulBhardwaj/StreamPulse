import express from 'express';
import { body } from 'express-validator';
import {
  streamVideo,
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleLike
} from '../controllers/videoController.js';
import { getVideoStats } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { uploadMedia } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

// Video Validation Rules
const videoCreateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Video title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('category')
    .notEmpty()
    .withMessage('Video category is required')
    .isIn(['Vlog', 'Sports', 'Movies', 'Tech', 'Music', 'Gaming', 'Education', 'Coding', 'IRL', 'Just Chatting', 'Other'])
    .withMessage('Invalid category selected')
];

// Public Routes
router.get('/', getVideos);
router.get('/analytics', getVideoStats); // Mongoose .aggregate() pipeline
router.get('/stats', getVideoStats);     // Alias
router.get('/stream/:id', streamVideo);  // HTTP 206 streaming route
router.get('/:id/stream', streamVideo);  // HTTP 206 streaming route (Twitch-style path)
router.get('/:id', getVideoById);

// Protected Routes (Creator and Admin)
router.post(
  '/',
  protect,
  authorizeRoles('creator', 'admin'),
  uploadMedia,
  videoCreateValidation,
  validate,
  createVideo
);

router.put(
  '/:id',
  protect,
  authorizeRoles('creator', 'admin'),
  updateVideo
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('creator', 'admin'),
  deleteVideo
);

// Protected User Route (Like/Unlike)
router.post('/:id/like', protect, toggleLike);

export default router;
