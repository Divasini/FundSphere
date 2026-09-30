import * as userRepo from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  adminSecretCode?: string;
}) => {
  const existingUser = await userRepo.findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('An account with this email address already exists');
  }

  // Check if registering as admin using passcode
  let assignedRole: Role = data.role || 'USER';
  if (data.adminSecretCode && data.adminSecretCode.trim() === 'admin2026') {
    assignedRole = 'ADMIN';
  }

  const passwordHash = await hashPassword(data.password);
  const user = await userRepo.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    role: assignedRole,
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const login = async (data: { email: string; password: string }) => {
  const user = await userRepo.findUserByEmail(data.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await comparePassword(data.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { passwordHash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getCurrentUser = async (userId: string) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; bio?: string; avatar?: string }
) => {
  return userRepo.updateUserProfile(userId, data);
};
