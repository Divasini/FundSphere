import prisma from '../config/db';
import { CampaignStatus, Prisma } from '@prisma/client';

export interface CampaignFilterOptions {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  status?: CampaignStatus | string;
  minGoal?: number;
  maxGoal?: number;
  sortBy?: 'newest' | 'endingSoon' | 'mostFunded' | 'goalAsc' | 'goalDesc';
  creatorId?: string;
}

export const findCampaigns = async (filters: CampaignFilterOptions) => {
  const where: Prisma.CampaignWhereInput = {};

  if (filters.status) {
    where.status = filters.status as CampaignStatus;
  }

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  } else if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.creatorId) {
    where.creatorId = filters.creatorId;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { shortDescription: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.minGoal !== undefined || filters.maxGoal !== undefined) {
    where.fundingGoal = {};
    if (filters.minGoal !== undefined) where.fundingGoal.gte = filters.minGoal;
    if (filters.maxGoal !== undefined) where.fundingGoal.lte = filters.maxGoal;
  }

  let orderBy: Prisma.CampaignOrderByWithRelationInput = { createdAt: 'desc' };
  if (filters.sortBy === 'endingSoon') {
    orderBy = { deadline: 'asc' };
  } else if (filters.sortBy === 'mostFunded') {
    orderBy = { amountRaised: 'desc' };
  } else if (filters.sortBy === 'goalAsc') {
    orderBy = { fundingGoal: 'asc' };
  } else if (filters.sortBy === 'goalDesc') {
    orderBy = { fundingGoal: 'desc' };
  }

  return prisma.campaign.findMany({
    where,
    orderBy,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          contributions: {
            where: { paymentStatus: 'SUCCESS' },
          },
        },
      },
    },
  });
};

export const findCampaignById = async (id: string) => {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
      },
      contributions: {
        where: { paymentStatus: 'SUCCESS' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          contributor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: {
        select: {
          contributions: {
            where: { paymentStatus: 'SUCCESS' },
          },
        },
      },
    },
  });
};

export const findCampaignBySlug = async (slug: string) => {
  return prisma.campaign.findUnique({
    where: { slug },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          contributions: {
            where: { paymentStatus: 'SUCCESS' },
          },
        },
      },
    },
  });
};

export const createCampaign = async (data: {
  creatorId: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  fundingGoal: number;
  deadline: Date;
  status: CampaignStatus;
  coverImage?: string;
}) => {
  return prisma.campaign.create({
    data,
    include: {
      category: true,
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const updateCampaign = async (
  id: string,
  data: Prisma.CampaignUpdateInput
) => {
  return prisma.campaign.update({
    where: { id },
    data,
    include: {
      category: true,
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const deleteCampaign = async (id: string) => {
  return prisma.campaign.delete({
    where: { id },
  });
};

export const recordInteraction = async (
  userId: string,
  campaignId: string,
  categoryId: string,
  interactionType: 'VIEW' | 'SAVE' | 'CONTRIBUTE'
) => {
  return prisma.campaignInteraction.create({
    data: {
      userId,
      campaignId,
      categoryId,
      interactionType,
    },
  });
};

export const addCampaignUpdate = async (
  campaignId: string,
  title: string,
  content: string
) => {
  return prisma.campaignUpdate.create({
    data: {
      campaignId,
      title,
      content,
    },
  });
};

export const getExpiredActiveCampaigns = async () => {
  const now = new Date();
  return prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
      deadline: {
        lte: now,
      },
    },
    include: {
      contributions: {
        where: { paymentStatus: 'SUCCESS' },
      },
    },
  });
};
