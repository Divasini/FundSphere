import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as notificationService from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const notifications = await notificationService.getMyNotifications(req.user.userId);
    return sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    await notificationService.markRead(req.params.id, req.user.userId);
    return sendSuccess(res, null, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    await notificationService.markAllRead(req.user.userId);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
