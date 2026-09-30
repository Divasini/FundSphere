import * as notificationRepo from '../repositories/notificationRepository';

export const getMyNotifications = async (userId: string) => {
  return notificationRepo.findNotificationsByUser(userId);
};

export const markRead = async (id: string, userId: string) => {
  return notificationRepo.markNotificationAsRead(id, userId);
};

export const markAllRead = async (userId: string) => {
  return notificationRepo.markAllNotificationsAsRead(userId);
};
