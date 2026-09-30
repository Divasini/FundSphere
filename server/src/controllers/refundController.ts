import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as refundService from '../services/refundService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getMyRefunds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const refunds = await refundService.getMyRefunds(req.user.userId);
    return sendSuccess(res, refunds, 'My refunds retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
