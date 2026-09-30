import { Router } from 'express';
import * as refundController from '../controllers/refundController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/my', authenticate, refundController.getMyRefunds);

export default router;
