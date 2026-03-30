import { prisma } from './prisma';
import { NotificationType } from './prisma-types';

export interface CreateNotificationOptions {
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(options: CreateNotificationOptions) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        link: options.link,
      },
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  options: Omit<CreateNotificationOptions, 'userId'>
) {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type: options.type,
            title: options.title,
            message: options.message,
            link: options.link,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    throw error;
  }
}

/**
 * Create notification for all users
 */
export async function createBroadcastNotification(
  options: Omit<CreateNotificationOptions, 'userId'>
) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    return createBulkNotifications(
      users.map((u) => u.id),
      options
    );
  } catch (error) {
    console.error('Create broadcast notification error:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
}

