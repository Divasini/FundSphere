import prisma from '../config/db';
import { Role } from '@prisma/client';

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; bio?: string; avatar?: string }
) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          campaigns: true,
          contributions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateUserRole = async (id: string, role: Role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};
