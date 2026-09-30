import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);

export default router;
