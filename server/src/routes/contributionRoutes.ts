import { Router } from 'express';
import * as contributionController from '../controllers/contributionController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { createContributionSchema } from '../validators/contributionValidator';

const router = Router();

router.post('/', authenticate, validateBody(createContributionSchema), contributionController.createContribution);
router.get('/my', authenticate, contributionController.getMyContributions);
router.get('/campaign/:id', contributionController.getCampaignContributions);

export default router;
