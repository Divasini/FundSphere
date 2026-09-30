import * as contributionRepo from '../repositories/contributionRepository';

export const createContribution = async (params: {
  campaignId: string;
  contributorId: string;
  amount: number;
  simulateFailure?: boolean;
}) => {
  if (params.amount <= 0) {
    throw new Error('Contribution amount must be greater than 0');
  }

  return contributionRepo.processContributionTransaction(params);
};

export const getMyContributions = async (userId: string) => {
  return contributionRepo.findContributionsByUser(userId);
};

export const getCampaignContributions = async (campaignId: string) => {
  return contributionRepo.findContributionsByCampaign(campaignId);
};

export const getAllContributionsAdmin = async () => {
  return contributionRepo.getAllContributionsAdmin();
};
