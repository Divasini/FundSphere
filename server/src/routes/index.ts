import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import campaignRoutes from './campaignRoutes';
import contributionRoutes from './contributionRoutes';
import refundRoutes from './refundRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import reportRoutes from './reportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/contributions', contributionRoutes);
router.use('/refunds', refundRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FundSphere API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
