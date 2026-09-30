import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as contributionService from '../services/contributionService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createContribution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to contribute', 401);
    }

    const { campaignId, amount, simulateFailure } = req.body;
    const result = await contributionService.createContribution({
      campaignId,
      contributorId: req.user.userId,
      amount: Number(amount),
      simulateFailure: Boolean(simulateFailure),
    });

    return sendSuccess(res, result, 'Contribution processed successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getMyContributions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const contributions = await contributionService.getMyContributions(req.user.userId);
    return sendSuccess(res, contributions, 'My contributions retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getCampaignContributions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contributions = await contributionService.getCampaignContributions(req.params.id);
    return sendSuccess(res, contributions, 'Campaign contributions retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
