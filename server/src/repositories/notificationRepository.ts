import prisma from '../config/db';

export const findNotificationsByUser = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

export const markNotificationAsRead = async (id: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) => {
  return prisma.notification.create({
    data,
  });
};
