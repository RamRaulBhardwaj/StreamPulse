import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  toggleFollow,
  getRecommendedChannels
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  validateEmailFormatAndBlocklist,
  checkDomainMx,
  validatePassword
} from '../utils/authValidation.js';

const router = express.Router();

const DEMO_LOGIN_EMAILS = [
  'viewer@example.com',
  'creator@example.com',
  'admin@example.com'
];

// Register Validation Rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is invalid')
    .custom(async (value) => {
      const check = validateEmailFormatAndBlocklist(value);
      if (!check.valid) {
        throw new Error('Email is invalid');
      }
      const hasMx = await checkDomainMx(check.domain);
      if (!hasMx) {
        throw new Error('Email is invalid');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage("Your password doesn't contain a letter or number, try adding some")
    .custom((value) => {
      const check = validatePassword(value);
      if (!check.valid) {
        throw new Error(check.error);
      }
      return true;
    }),
  body('role')
    .optional()
    .isIn(['viewer', 'creator'])
    .withMessage('Role must be either viewer or creator')
];

// Login Validation Rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is invalid')
    .custom((value) => {
      const lower = value.trim().toLowerCase();
      if (DEMO_LOGIN_EMAILS.includes(lower)) {
        return true;
      }
      const check = validateEmailFormatAndBlocklist(lower);
      if (!check.valid) {
        throw new Error('Email is invalid');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/follow/:creatorId', protect, toggleFollow);
router.get('/channels', getRecommendedChannels);

export default router;
