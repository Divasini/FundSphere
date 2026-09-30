import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as categoryService from '../services/categoryService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const onlyActive = req.query.all !== 'true';
    const categories = await categoryService.getAllCategories(onlyActive);
    return sendSuccess(res, categories, 'Categories fetched');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return sendSuccess(res, category, 'Category fetched');
  } catch (error: any) {
    return sendError(res, error.message, 404);
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
