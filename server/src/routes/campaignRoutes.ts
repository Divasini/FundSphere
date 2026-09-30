import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignUpdatePostSchema,
} from '../validators/campaignValidator';

const router = Router();

// Public / optional auth
router.get('/', optionalAuthenticate, campaignController.getCampaigns);
router.get('/recommendations', optionalAuthenticate, campaignController.getRecommendations);
router.post('/analyze-draft', optionalAuthenticate, campaignController.analyzeDraft);
router.get('/:id/innovation-analysis', optionalAuthenticate, campaignController.getInnovationAnalysis);
router.get('/:id', optionalAuthenticate, campaignController.getCampaign);

// Authenticated user
router.post('/', authenticate, validateBody(createCampaignSchema), campaignController.createCampaign);
router.put('/:id', authenticate, validateBody(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', authenticate, campaignController.deleteCampaign);
router.post('/:id/submit', authenticate, campaignController.submitCampaign);
router.post('/:id/updates', authenticate, validateBody(campaignUpdatePostSchema), campaignController.postCampaignUpdate);

export default router;
