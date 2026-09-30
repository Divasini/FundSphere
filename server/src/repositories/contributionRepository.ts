import prisma from '../config/db';
import { generateTransactionReference } from '../utils/referenceGenerator';

export const findContributionsByUser = async (userId: string) => {
  return prisma.contribution.findMany({
    where: { contributorId: userId },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          status: true,
          fundingGoal: true,
          amountRaised: true,
          deadline: true,
        },
      },
      refund: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findContributionsByCampaign = async (campaignId: string) => {
  return prisma.contribution.findMany({
    where: { campaignId },
    include: {
      contributor: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      refund: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllContributionsAdmin = async () => {
  return prisma.contribution.findMany({
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      contributor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      refund: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const processContributionTransaction = async (params: {
  campaignId: string;
  contributorId: string;
  amount: number;
  simulateFailure?: boolean;
}) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch current campaign under lock/transaction
    const campaign = await tx.campaign.findUnique({
      where: { id: params.campaignId },
      include: { creator: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'ACTIVE' && campaign.status !== 'FUNDED') {
      throw new Error(`Contributions are not accepted for campaigns with status ${campaign.status}`);
    }

    if (new Date(campaign.deadline).getTime() <= Date.now()) {
      throw new Error('This campaign deadline has already passed');
    }

    if (params.simulateFailure) {
      // Simulate failed payment gateway
      const txnRef = generateTransactionReference();
      const failedContribution = await tx.contribution.create({
        data: {
          campaignId: params.campaignId,
          contributorId: params.contributorId,
          amount: params.amount,
          paymentStatus: 'FAILED',
          transactionReference: txnRef,
        },
      });
      throw new Error('Simulated payment gateway declined the transaction');
    }

    // 2. Generate unique reference
    const transactionReference = generateTransactionReference();

    // 3. Create contribution record
    const contribution = await tx.contribution.create({
      data: {
        campaignId: params.campaignId,
        contributorId: params.contributorId,
        amount: params.amount,
        paymentStatus: 'SUCCESS',
        transactionReference,
      },
    });

    // 4. Update campaign amountRaised
    const newAmountRaised = campaign.amountRaised + params.amount;
    const isGoalReached = newAmountRaised >= campaign.fundingGoal;

    const updatedCampaign = await tx.campaign.update({
      where: { id: params.campaignId },
      data: {
        amountRaised: newAmountRaised,
        status: isGoalReached ? 'FUNDED' : campaign.status,
      },
    });

    // 5. Create notifications
    // Notify contributor
    await tx.notification.create({
      data: {
        userId: params.contributorId,
        title: 'Contribution Successful',
        message: `You successfully contributed ₹${params.amount.toLocaleString('en-IN')} to "${campaign.title}". Ref: ${transactionReference}`,
        type: 'CONTRIBUTION_SUCCESS',
      },
    });

    // Notify campaign creator
    await tx.notification.create({
      data: {
        userId: campaign.creatorId,
        title: 'New Contribution Received',
        message: `Your campaign "${campaign.title}" received a new contribution of ₹${params.amount.toLocaleString('en-IN')}.`,
        type: 'CONTRIBUTION_RECEIVED',
      },
    });

    // If goal just reached, create goal notification
    if (isGoalReached && campaign.status !== 'FUNDED') {
      await tx.notification.create({
        data: {
          userId: campaign.creatorId,
          title: 'Funding Goal Achieved!',
          message: `Congratulations! Your campaign "${campaign.title}" has reached 100% of its funding goal (₹${campaign.fundingGoal.toLocaleString('en-IN')})!`,
          type: 'CAMPAIGN_FUNDED',
        },
      });
    }

    // 6. Record interaction for recommendations
    await tx.campaignInteraction.create({
      data: {
        userId: params.contributorId,
        campaignId: params.campaignId,
        categoryId: campaign.categoryId,
        interactionType: 'CONTRIBUTE',
      },
    });

    return {
      contribution,
      campaign: updatedCampaign,
    };
  });
};
