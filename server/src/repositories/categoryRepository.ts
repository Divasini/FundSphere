import prisma from '../config/db';

export const findAllCategories = async (onlyActive = true) => {
  return prisma.category.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    include: {
      _count: {
        select: {
          campaigns: {
            where: {
              status: { in: ['ACTIVE', 'FUNDED', 'SUCCESSFUL'] },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
};

export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

export const findCategoryBySlug = async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
  });
};

export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}) => {
  return prisma.category.create({
    data,
  });
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }
) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};
