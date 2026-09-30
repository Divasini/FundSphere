import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.patch('/:id/read', authenticate, notificationController.markAsRead);

export default router;
