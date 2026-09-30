import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as analyticsService from '../services/analyticsService';
import * as campaignService from '../services/campaignService';
import * as contributionService from '../services/contributionService';
import * as refundService from '../services/refundService';
import * as userRepo from '../repositories/userRepository';
import { checkExpiredCampaigns } from '../jobs/deadlineChecker';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await analyticsService.getAdminStats();
    return sendSuccess(res, stats, 'Admin statistics retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getPendingCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pending = await campaignService.getCampaigns({ status: 'PENDING_REVIEW' });
    return sendSuccess(res, pending, 'Pending review campaigns retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const approveCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approved = await campaignService.approveCampaign(req.params.id);
    return sendSuccess(res, approved, 'Campaign approved successfully and is now ACTIVE');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const rejectCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      return sendError(res, 'A rejection reason of at least 5 characters is required', 400);
    }

    const rejected = await campaignService.rejectCampaign(req.params.id, reason);
    return sendSuccess(res, rejected, 'Campaign rejected with reason recorded');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await userRepo.getAllUsers();
    return sendSuccess(res, users, 'Users retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getContributions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contributions = await contributionService.getAllContributionsAdmin();
    return sendSuccess(res, contributions, 'All contributions retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getRefunds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const refunds = await refundService.getAllRefundsAdmin();
    return sendSuccess(res, refunds, 'All refunds retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const triggerDeadlineCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await checkExpiredCampaigns();
    return sendSuccess(res, result, 'Deadline checking executed');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== 'USER' && role !== 'ADMIN') {
      return sendError(res, 'Role must be USER or ADMIN', 400);
    }
    const updated = await userRepo.updateUserRole(req.params.id, role);
    return sendSuccess(res, updated, `User role updated to ${role}`);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
