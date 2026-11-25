import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';

/**
 * Authentication Middleware: Protects endpoints by verifying JWT token
 */
export const protect = async (req, _res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token missing. Access denied.');
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretjwtkey_bee_project_2026_dev_mode'
    );

    let user = null;

    // Check DB only if MongoDB connection is active
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
      try {
        user = await User.findById(decoded.id);
      } catch {
        // Fallback to decoded payload below
      }
    }

    // If database is offline or user not in DB, reconstruct user from verified JWT payload
    if (!user) {
      const fallbackId = decoded.id || '6650fae94d8f1b2039c01007';
      const fallbackName = decoded.name || 'JohnDoe';
      user = {
        _id: fallbackId,
        id: fallbackId,
        name: fallbackName,
        email: decoded.email || 'viewer@example.com',
        role: decoded.role || 'viewer',
        avatar:
          decoded.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackName)}`,
        following: []
      };
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
