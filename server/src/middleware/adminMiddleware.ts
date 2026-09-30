import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { sendError } from '../utils/apiResponse';

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'ADMIN') {
    return sendError(res, 'Access denied. Administrator privileges required.', 403);
  }

  next();
};
