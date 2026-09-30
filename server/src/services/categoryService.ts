import * as categoryRepo from '../repositories/categoryRepository';
import { generateSlug } from '../utils/referenceGenerator';

export const getAllCategories = async (onlyActive = true) => {
  return categoryRepo.findAllCategories(onlyActive);
};

export const getCategoryById = async (id: string) => {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  icon?: string;
}) => {
  const slug = generateSlug(data.name);
  return categoryRepo.createCategory({
    ...data,
    slug,
  });
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }
) => {
  const slug = data.name ? generateSlug(data.name) : undefined;
  return categoryRepo.updateCategory(id, {
    ...data,
    ...(slug ? { slug } : {}),
  });
};

export const deleteCategory = async (id: string) => {
  return categoryRepo.deleteCategory(id);
};
