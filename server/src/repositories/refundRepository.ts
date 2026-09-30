import prisma from '../config/db';
import { generateRefundReference } from '../utils/referenceGenerator';

export const findRefundsByUser = async (userId: string) => {
  return prisma.refund.findMany({
    where: {
      contribution: {
        contributorId: userId,
      },
    },
    include: {
      contribution: {
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: { processedAt: 'desc' },
  });
};

export const getAllRefundsAdmin = async () => {
  return prisma.refund.findMany({
    include: {
      contribution: {
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { processedAt: 'desc' },
  });
};

/**
 * Process refund for a specific contribution. Idempotent.
 */
export const processRefundForContribution = async (contributionId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch contribution
    const contribution = await tx.contribution.findUnique({
      where: { id: contributionId },
      include: {
        campaign: true,
        refund: true,
      },
    });

    if (!contribution) {
      throw new Error(`Contribution ${contributionId} not found`);
    }

    // 2. Idempotency check: if already refunded or refund record exists, skip
    if (contribution.refund || contribution.paymentStatus === 'REFUNDED') {
      return { skipped: true, refund: contribution.refund };
    }

    if (contribution.paymentStatus !== 'SUCCESS') {
      throw new Error(`Cannot refund contribution with status ${contribution.paymentStatus}`);
    }

    const refundReference = generateRefundReference();

    // 3. Create Refund record
    const refund = await tx.refund.create({
      data: {
        contributionId: contribution.id,
        amount: contribution.amount,
        status: 'COMPLETED',
        refundReference,
        processedAt: new Date(),
      },
    });

    // 4. Update contribution status
    await tx.contribution.update({
      where: { id: contribution.id },
      data: { paymentStatus: 'REFUNDED' },
    });

    // 5. Send dynamic notification with actual campaign name and contribution amount
    await tx.notification.create({
      data: {
        userId: contribution.contributorId,
        title: 'Refund Processed',
        message: `Your contribution of ₹${contribution.amount.toLocaleString('en-IN')} for "${contribution.campaign.title}" has been refunded. Refund Ref: ${refundReference}.`,
        type: 'REFUND_PROCESSED',
      },
    });

    return { skipped: false, refund };
  });
};

/**
 * Process all refunds for a failed campaign. Idempotent.
 */
export const processRefundsForFailedCampaign = async (campaignId: string) => {
  const contributions = await prisma.contribution.findMany({
    where: {
      campaignId,
      paymentStatus: 'SUCCESS',
    },
  });

  const results = [];
  for (const contrib of contributions) {
    try {
      const res = await processRefundForContribution(contrib.id);
      results.push(res);
    } catch (err: any) {
      console.error(`Failed to refund contribution ${contrib.id}:`, err.message);
    }
  }

  return results;
};
