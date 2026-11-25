import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

/**
 * Validates request inputs based on express-validator rules
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    const primaryMessage = extractedErrors[0]?.message || 'Input validation failed';
    return next(new ApiError(400, primaryMessage, extractedErrors));
  }
  next();
};
