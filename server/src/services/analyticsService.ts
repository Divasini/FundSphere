import prisma from '../config/db';
import * as reportRepo from '../repositories/reportRepository';

export const getLandingMetrics = async () => {
  const [totalCampaigns, successfulCampaigns, contributionsAgg, supportersAgg] = await Promise.all([
    prisma.campaign.count({
      where: { status: { in: ['ACTIVE', 'FUNDED', 'SUCCESSFUL'] } },
    }),
    prisma.campaign.count({
      where: { status: { in: ['FUNDED', 'SUCCESSFUL'] } },
    }),
    prisma.contribution.aggregate({
      where: { paymentStatus: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.contribution.groupBy({
      by: ['contributorId'],
      where: { paymentStatus: 'SUCCESS' },
    }),
  ]);

  const totalFundsRaised = contributionsAgg._sum.amount || 0;
  const totalSupporters = supportersAgg.length;
  const hasData = totalCampaigns > 0 || totalFundsRaised > 0 || totalSupporters > 0;

  return {
    hasData,
    totalCampaigns,
    successfulCampaigns,
    totalFundsRaised,
    totalSupporters,
  };
};

export const getUserDashboardStats = async (userId: string) => {
  const [
    contributionsAgg,
    activeContributionsCount,
    campaignsCreatedCount,
    successfulCampaignsCount,
    recentContributions,
    myCampaigns,
  ] = await Promise.all([
    // Total contributed (successful)
    prisma.contribution.aggregate({
      where: { contributorId: userId, paymentStatus: 'SUCCESS' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // Active contributions (campaigns that are still ACTIVE or FUNDED)
    prisma.contribution.count({
      where: {
        contributorId: userId,
        paymentStatus: 'SUCCESS',
        campaign: { status: { in: ['ACTIVE', 'FUNDED'] } },
      },
    }),
    // Campaigns created
    prisma.campaign.count({
      where: { creatorId: userId },
    }),
    // Successful campaigns created
    prisma.campaign.count({
      where: { creatorId: userId, status: { in: ['FUNDED', 'SUCCESSFUL'] } },
    }),
    // Recent contributions
    prisma.contribution.findMany({
      where: { contributorId: userId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            fundingGoal: true,
            amountRaised: true,
          },
        },
        refund: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // User campaigns
    prisma.campaign.findMany({
      where: { creatorId: userId },
      include: {
        category: true,
        _count: {
          select: { contributions: { where: { paymentStatus: 'SUCCESS' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    totalContributed: contributionsAgg._sum.amount || 0,
    totalContributionsCount: contributionsAgg._count.id || 0,
    activeContributionsCount,
    campaignsCreatedCount,
    successfulCampaignsCount,
    recentContributions,
    myCampaigns,
  };
};

export const getAdminStats = async () => {
  return reportRepo.getPlatformOverviewMetrics();
};

export const getReportsData = async () => {
  const [overview, categoryDistribution, contributionTrends, campaignTrends] = await Promise.all([
    reportRepo.getPlatformOverviewMetrics(),
    reportRepo.getCategoryDistribution(),
    reportRepo.getContributionTrends(),
    reportRepo.getCampaignTrends(),
  ]);

  const hasData =
    overview.totalCampaigns > 0 ||
    overview.totalContributions > 0 ||
    categoryDistribution.length > 0;

  return {
    hasData,
    overview,
    categoryDistribution,
    contributionTrends,
    campaignTrends,
  };
};
