import express from 'express';
import { body } from 'express-validator';
import {
  getVideoComments,
  createComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router({ mergeParams: true });

const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment text cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

// Mount on /api/videos/:videoId/comments
router.get('/:videoId/comments', getVideoComments);
router.post('/:videoId/comments', protect, commentValidation, validate, createComment);

// Direct comment route: /api/comments/:id
router.delete('/comments/:id', protect, deleteComment);

export default router;
