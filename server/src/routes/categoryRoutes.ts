import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidator';

const router = Router();

// Public: Get categories
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Admin only: create, update, delete
router.post('/', authenticate, requireAdmin, validateBody(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validateBody(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

export default router;
