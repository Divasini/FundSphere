import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as authService from '../services/authService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Login successful', 200);
  } catch (error: any) {
    return sendError(res, error.message, 401);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    const user = await authService.getCurrentUser(req.user.userId);
    return sendSuccess(res, user, 'Profile retrieved', 200);
  } catch (error: any) {
    return sendError(res, error.message, 404);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    const updated = await authService.updateProfile(req.user.userId, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully', 200);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
