import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as analyticsService from '../services/analyticsService';
import * as reportRepo from '../repositories/reportRepository';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getOverviewReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await analyticsService.getReportsData();
    return sendSuccess(res, data, 'Reports overview retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getCategoryReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await reportRepo.getCategoryDistribution();
    return sendSuccess(res, data, 'Category distribution retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getTrendsReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [contributions, campaigns] = await Promise.all([
      reportRepo.getContributionTrends(),
      reportRepo.getCampaignTrends(),
    ]);
    return sendSuccess(res, { contributions, campaigns }, 'Trends report retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getLandingMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await analyticsService.getLandingMetrics();
    return sendSuccess(res, data, 'Landing metrics retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getUserDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const data = await analyticsService.getUserDashboardStats(req.user.userId);
    return sendSuccess(res, data, 'User dashboard stats retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
