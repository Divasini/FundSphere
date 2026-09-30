import * as refundRepo from '../repositories/refundRepository';

export const getMyRefunds = async (userId: string) => {
  return refundRepo.findRefundsByUser(userId);
};

export const getAllRefundsAdmin = async () => {
  return refundRepo.getAllRefundsAdmin();
};

export const processSingleRefund = async (contributionId: string) => {
  return refundRepo.processRefundForContribution(contributionId);
};
