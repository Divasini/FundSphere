import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public / Landing
router.get('/landing-metrics', reportController.getLandingMetrics);

// Authenticated user
router.get('/dashboard-stats', authenticate, reportController.getUserDashboardStats);

// Reports overview & trends
router.get('/overview', reportController.getOverviewReport);
router.get('/category', reportController.getCategoryReport);
router.get('/trends', reportController.getTrendsReport);

export default router;
