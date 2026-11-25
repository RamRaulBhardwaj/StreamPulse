import { ApiError } from '../utils/apiError.js';

/**
 * Role-Based Access Control (RBAC) Middleware (Unit 4)
 * @param  {...string} roles Allowed roles ('viewer', 'creator', 'admin')
 */
export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User must be authenticated before role verification.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`
        )
      );
    }

    next();
  };
};
