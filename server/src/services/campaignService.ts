import * as campaignRepo from '../repositories/campaignRepository';
import * as categoryRepo from '../repositories/categoryRepository';
import * as notificationRepo from '../repositories/notificationRepository';
import { generateSlug } from '../utils/referenceGenerator';
import { CampaignStatus } from '@prisma/client';

export const calculateCampaignMetrics = (campaign: any) => {
  const fundingGoal = Number(campaign.fundingGoal);
  const amountRaised = Number(campaign.amountRaised);
  const percentage = fundingGoal > 0 ? Math.round((amountRaised / fundingGoal) * 1000) / 10 : 0;
  const isExpired = new Date(campaign.deadline).getTime() <= Date.now();
  const supporterCount = campaign._count?.contributions ?? campaign.contributions?.length ?? 0;
  const daysRemaining = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return {
    ...campaign,
    fundingPercentage: percentage,
    supporterCount,
    isExpired,
    daysRemaining,
  };
};

export const getCampaigns = async (filters: campaignRepo.CampaignFilterOptions) => {
  const campaigns = await campaignRepo.findCampaigns(filters);
  return campaigns.map(calculateCampaignMetrics);
};

export const getCampaignById = async (id: string, viewerId?: string) => {
  const campaign = await campaignRepo.findCampaignById(id);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Record view interaction if viewer is logged in and not the creator
  if (viewerId && viewerId !== campaign.creatorId) {
    try {
      await campaignRepo.recordInteraction(viewerId, campaign.id, campaign.categoryId, 'VIEW');
    } catch (e) {
      // Non-critical, ignore error
    }
  }

  return calculateCampaignMetrics(campaign);
};

export const createCampaign = async (
  userId: string,
  data: {
    title: string;
    shortDescription: string;
    description: string;
    categoryId: string;
    fundingGoal: number;
    deadline: string;
    coverImage?: string;
    isDraft?: boolean;
  }
) => {
  // Validate category
  const category = await categoryRepo.findCategoryById(data.categoryId);
  if (!category) {
    throw new Error('Selected category does not exist');
  }

  const slug = generateSlug(data.title);
  const deadlineDate = new Date(data.deadline);
  const status: CampaignStatus = data.isDraft ? 'DRAFT' : 'PENDING_REVIEW';

  const campaign = await campaignRepo.createCampaign({
    creatorId: userId,
    categoryId: data.categoryId,
    title: data.title,
    slug,
    shortDescription: data.shortDescription,
    description: data.description,
    fundingGoal: data.fundingGoal,
    deadline: deadlineDate,
    status,
    coverImage: data.coverImage || undefined,
  });

  if (!data.isDraft) {
    await notificationRepo.createNotification({
      userId,
      title: 'Campaign Submitted for Review',
      message: `Your campaign "${data.title}" was submitted and is currently pending administrator review.`,
      type: 'CAMPAIGN_SUBMITTED',
    });
  }

  return calculateCampaignMetrics(campaign);
};

export const submitCampaign = async (campaignId: string, userId: string) => {
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.creatorId !== userId) {
    throw new Error('Unauthorized to submit this campaign');
  }

  if (campaign.status !== 'DRAFT') {
    throw new Error(`Only draft campaigns can be submitted for review. Current status: ${campaign.status}`);
  }

  const updated = await campaignRepo.updateCampaign(campaignId, {
    status: 'PENDING_REVIEW',
  });

  await notificationRepo.createNotification({
    userId,
    title: 'Campaign Submitted for Review',
    message: `Your campaign "${campaign.title}" is now awaiting administrative approval.`,
    type: 'CAMPAIGN_SUBMITTED',
  });

  return calculateCampaignMetrics(updated);
};

export const updateCampaign = async (
  campaignId: string,
  userId: string,
  userRole: string,
  data: any
) => {
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (userRole !== 'ADMIN' && campaign.creatorId !== userId) {
    throw new Error('Unauthorized to update this campaign');
  }

  // If campaign is already active/funded/successful, cannot alter core financial terms
  if (campaign.status !== 'DRAFT' && campaign.status !== 'REJECTED' && userRole !== 'ADMIN') {
    delete data.fundingGoal;
    delete data.deadline;
  }

  if (data.deadline) {
    data.deadline = new Date(data.deadline);
  }

  const updated = await campaignRepo.updateCampaign(campaignId, data);
  return calculateCampaignMetrics(updated);
};

export const deleteCampaign = async (campaignId: string, userId: string, userRole: string) => {
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (userRole !== 'ADMIN' && campaign.creatorId !== userId) {
    throw new Error('Unauthorized to delete this campaign');
  }

  // Only drafts or rejected or campaigns with 0 contributions can be deleted
  if (campaign.amountRaised > 0 && userRole !== 'ADMIN') {
    throw new Error('Cannot delete a campaign that has received contributions');
  }

  return campaignRepo.deleteCampaign(campaignId);
};

export const postCampaignUpdate = async (
  campaignId: string,
  userId: string,
  title: string,
  content: string
) => {
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.creatorId !== userId) {
    throw new Error('Only the campaign creator can post updates');
  }

  const update = await campaignRepo.addCampaignUpdate(campaignId, title, content);

  // Notify all successful contributors of the update
  const contributors = campaign.contributions || [];
  const uniqueContributorIds = Array.from(new Set(contributors.map((c) => c.contributor?.id).filter(Boolean)));

  for (const contribUserId of uniqueContributorIds) {
    try {
      await notificationRepo.createNotification({
        userId: contribUserId as string,
        title: `Update on "${campaign.title}"`,
        message: `New update posted: "${title}"`,
        type: 'CAMPAIGN_UPDATE',
      });
    } catch (e) {
      // non-fatal
    }
  }

  return update;
};

// Admin operations
export const approveCampaign = async (campaignId: string) => {
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'PENDING_REVIEW') {
    throw new Error(`Only pending review campaigns can be approved. Current status: ${campaign.status}`);
  }

  const updated = await campaignRepo.updateCampaign(campaignId, {
    status: 'ACTIVE',
    rejectionReason: null,
  });

  await notificationRepo.createNotification({
    userId: campaign.creatorId,
    title: 'Campaign Approved!',
    message: `Your campaign "${campaign.title}" has been approved and is now LIVE for contributions!`,
    type: 'CAMPAIGN_APPROVED',
  });

  return calculateCampaignMetrics(updated);
};

export const rejectCampaign = async (campaignId: string, reason: string) => {
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'PENDING_REVIEW') {
    throw new Error(`Only pending review campaigns can be rejected. Current status: ${campaign.status}`);
  }

  const updated = await campaignRepo.updateCampaign(campaignId, {
    status: 'REJECTED',
    rejectionReason: reason,
  });

  await notificationRepo.createNotification({
    userId: campaign.creatorId,
    title: 'Campaign Not Approved',
    message: `Your campaign "${campaign.title}" was not approved. Reason: ${reason}`,
    type: 'CAMPAIGN_REJECTED',
  });

  return calculateCampaignMetrics(updated);
};
