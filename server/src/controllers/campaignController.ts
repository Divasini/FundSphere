import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as campaignService from '../services/campaignService';
import * as recommendationService from '../services/recommendationService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      category,
      categoryId,
      status,
      minGoal,
      maxGoal,
      sortBy,
      creatorId,
    } = req.query;

    const campaigns = await campaignService.getCampaigns({
      search: search as string,
      categorySlug: category as string,
      categoryId: categoryId as string,
      status: status as string,
      minGoal: minGoal ? parseFloat(minGoal as string) : undefined,
      maxGoal: maxGoal ? parseFloat(maxGoal as string) : undefined,
      sortBy: sortBy as any,
      creatorId: creatorId as string,
    });

    return sendSuccess(res, campaigns, 'Campaigns retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const viewerId = req.user?.userId;
    const campaign = await campaignService.getCampaignById(req.params.id, viewerId);
    return sendSuccess(res, campaign, 'Campaign details retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 404);
  }
};

export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const campaign = await campaignService.createCampaign(req.user.userId, req.body);
    return sendSuccess(res, campaign, 'Campaign created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const updated = await campaignService.updateCampaign(
      req.params.id,
      req.user.userId,
      req.user.role,
      req.body
    );
    return sendSuccess(res, updated, 'Campaign updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    await campaignService.deleteCampaign(req.params.id, req.user.userId, req.user.role);
    return sendSuccess(res, null, 'Campaign deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const submitCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const campaign = await campaignService.submitCampaign(req.params.id, req.user.userId);
    return sendSuccess(res, campaign, 'Campaign submitted for administrative review');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const postCampaignUpdate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { title, content } = req.body;
    const update = await campaignService.postCampaignUpdate(
      req.params.id,
      req.user.userId,
      title,
      content
    );
    return sendSuccess(res, update, 'Campaign update posted successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await recommendationService.getPersonalizedRecommendations(req.user?.userId);
    return sendSuccess(res, result, 'Recommendations retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getInnovationAnalysis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    const { analyzeCampaignInnovation } = await import('../services/innovationService');
    const analysis = analyzeCampaignInnovation({
      title: campaign.title,
      shortDescription: campaign.shortDescription,
      description: campaign.description,
      fundingGoal: campaign.fundingGoal,
      categoryName: campaign.category?.name,
      deadline: campaign.deadline,
    });
    return sendSuccess(res, analysis, 'Innovation analysis computed');
  } catch (error: any) {
    return sendError(res, error.message, 404);
  }
};

export const analyzeDraft = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, shortDescription, description, fundingGoal, categoryName } = req.body;
    const { analyzeCampaignInnovation } = await import('../services/innovationService');
    const analysis = analyzeCampaignInnovation({
      title: title || '',
      shortDescription: shortDescription || '',
      description: description || '',
      fundingGoal: Number(fundingGoal) || 0,
      categoryName,
    });
    return sendSuccess(res, analysis, 'Draft innovation analysis computed');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
