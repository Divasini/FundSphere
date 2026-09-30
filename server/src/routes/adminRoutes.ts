import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { rejectCampaignSchema } from '../validators/campaignValidator';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/campaigns/pending', adminController.getPendingCampaigns);
router.patch('/campaigns/:id/approve', adminController.approveCampaign);
router.patch('/campaigns/:id/reject', validateBody(rejectCampaignSchema), adminController.rejectCampaign);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/contributions', adminController.getContributions);
router.get('/refunds', adminController.getRefunds);
router.post('/deadline-check', adminController.triggerDeadlineCheck);

export default router;
