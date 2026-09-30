import prisma from '../config/db';
import { calculateCampaignMetrics } from './campaignService';

export const getPersonalizedRecommendations = async (userId?: string) => {
  if (!userId) {
    return {
      hasActivity: false,
      message: 'Explore campaigns to personalize your recommendations.',
      recommendations: [],
    };
  }

  // 1. Fetch user's interactions
  const interactions = await prisma.campaignInteraction.findMany({
    where: { userId },
    select: {
      categoryId: true,
      campaignId: true,
      interactionType: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  if (interactions.length === 0) {
    return {
      hasActivity: false,
      message: 'Explore campaigns to personalize your recommendations.',
      recommendations: [],
    };
  }

  // 2. Weight categories by interaction type
  // CONTRIBUTE: 3 points, VIEW: 1 point
  const categoryScores: Record<string, number> = {};
  const interactedCampaignIds = new Set<string>();

  for (const item of interactions) {
    interactedCampaignIds.add(item.campaignId);
    const weight = item.interactionType === 'CONTRIBUTE' ? 3 : 1;
    categoryScores[item.categoryId] = (categoryScores[item.categoryId] || 0) + weight;
  }

  // Sort categories by score descending
  const topCategoryIds = Object.keys(categoryScores).sort(
    (a, b) => categoryScores[b] - categoryScores[a]
  );

  // 3. Find active campaigns in these top categories
  const recommendedCampaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
      categoryId: { in: topCategoryIds },
      deadline: { gt: new Date() },
    },
    include: {
      category: true,
      creator: {
        select: { id: true, name: true, avatar: true },
      },
      _count: {
        select: {
          contributions: { where: { paymentStatus: 'SUCCESS' } },
        },
      },
    },
    take: 6,
  });

  // Get category names of top interests
  const topCategories = await prisma.category.findMany({
    where: { id: { in: topCategoryIds.slice(0, 3) } },
    select: { name: true },
  });

  const categoryNames = topCategories.map((c) => c.name).join(', ');

  return {
    hasActivity: true,
    message: categoryNames ? `Recommended based on your interest in ${categoryNames}` : 'Recommended for you',
    recommendations: recommendedCampaigns.map(calculateCampaignMetrics),
  };
};
