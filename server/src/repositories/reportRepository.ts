import prisma from '../config/db';

export const getPlatformOverviewMetrics = async () => {
  const [
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    successfulCampaigns,
    failedCampaigns,
    pendingCampaigns,
    contributionsAgg,
    refundsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.campaign.count({ where: { status: { in: ['SUCCESSFUL', 'FUNDED'] } } }),
    prisma.campaign.count({ where: { status: 'FAILED' } }),
    prisma.campaign.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.contribution.aggregate({
      where: { paymentStatus: 'SUCCESS' },
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true },
    }),
    prisma.refund.aggregate({
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    successfulCampaigns,
    failedCampaigns,
    pendingCampaigns,
    totalContributions: contributionsAgg._count.id || 0,
    totalFundsRaised: contributionsAgg._sum.amount || 0,
    averageContribution: Math.round((contributionsAgg._avg.amount || 0) * 100) / 100,
    totalRefunds: refundsAgg._count.id || 0,
    totalRefundAmount: refundsAgg._sum.amount || 0,
  };
};

export const getCategoryDistribution = async () => {
  const categories = await prisma.category.findMany({
    include: {
      campaigns: {
        select: {
          id: true,
          amountRaised: true,
          status: true,
        },
      },
    },
  });

  return categories.map((cat) => {
    const campaignCount = cat.campaigns.length;
    const totalRaised = cat.campaigns.reduce((sum, c) => sum + c.amountRaised, 0);
    return {
      categoryId: cat.id,
      name: cat.name,
      slug: cat.slug,
      campaignCount,
      totalRaised,
    };
  }).filter((c) => c.campaignCount > 0);
};

export const getContributionTrends = async () => {
  const contributions = await prisma.contribution.findMany({
    where: { paymentStatus: { in: ['SUCCESS', 'REFUNDED'] } },
    select: {
      amount: true,
      createdAt: true,
      paymentStatus: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date (YYYY-MM-DD)
  const map: Record<string, { date: string; amount: number; count: number }> = {};
  for (const c of contributions) {
    const dateStr = c.createdAt.toISOString().split('T')[0];
    if (!map[dateStr]) {
      map[dateStr] = { date: dateStr, amount: 0, count: 0 };
    }
    map[dateStr].amount += c.amount;
    map[dateStr].count += 1;
  }

  return Object.values(map);
};

export const getCampaignTrends = async () => {
  const campaigns = await prisma.campaign.findMany({
    select: {
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const map: Record<string, { date: string; created: number }> = {};
  for (const c of campaigns) {
    const dateStr = c.createdAt.toISOString().split('T')[0];
    if (!map[dateStr]) {
      map[dateStr] = { date: dateStr, created: 0 };
    }
    map[dateStr].created += 1;
  }

  return Object.values(map);
};
