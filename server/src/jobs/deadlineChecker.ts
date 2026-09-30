import prisma from '../config/db';
import * as campaignRepo from '../repositories/campaignRepository';
import * as refundRepo from '../repositories/refundRepository';
import * as notificationRepo from '../repositories/notificationRepository';

export const checkExpiredCampaigns = async () => {
  try {
    const expiredCampaigns = await campaignRepo.getExpiredActiveCampaigns();

    if (expiredCampaigns.length === 0) {
      return { processed: 0 };
    }

    console.log(`[Deadline Job] Found ${expiredCampaigns.length} expired campaign(s) to process.`);

    for (const campaign of expiredCampaigns) {
      const isGoalReached = campaign.amountRaised >= campaign.fundingGoal;

      if (isGoalReached) {
        // Mark as SUCCESSFUL
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'SUCCESSFUL' },
        });

        // Notify creator
        await notificationRepo.createNotification({
          userId: campaign.creatorId,
          title: 'Campaign Succeeded!',
          message: `Congratulations! Your campaign "${campaign.title}" successfully completed with ₹${campaign.amountRaised.toLocaleString('en-IN')} raised!`,
          type: 'CAMPAIGN_SUCCESS',
        });

        console.log(`[Deadline Job] Campaign "${campaign.title}" marked as SUCCESSFUL.`);
      } else {
        // Mark as FAILED
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' },
        });

        // Notify creator
        await notificationRepo.createNotification({
          userId: campaign.creatorId,
          title: 'Campaign Ended (Goal Not Reached)',
          message: `Your campaign "${campaign.title}" deadline has passed without reaching its goal. All supporters are receiving automated refunds.`,
          type: 'CAMPAIGN_FAILED',
        });

        console.log(`[Deadline Job] Campaign "${campaign.title}" marked as FAILED. Processing refunds...`);

        // Automatically trigger idempotent refund process for all successful contributions
        const refundResults = await refundRepo.processRefundsForFailedCampaign(campaign.id);
        console.log(`[Deadline Job] Processed ${refundResults.length} refunds for campaign "${campaign.title}".`);
      }
    }

    return { processed: expiredCampaigns.length };
  } catch (error) {
    console.error('[Deadline Job Error]:', error);
    return { processed: 0, error };
  }
};

export const startDeadlineCheckerJob = (intervalMs = 30000) => {
  console.log(`[Deadline Job] Scheduled deadline checker running every ${intervalMs / 1000}s.`);
  // Run once immediately on start
  checkExpiredCampaigns();
  // Set recurring interval
  return setInterval(checkExpiredCampaigns, intervalMs);
};
