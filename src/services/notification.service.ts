import { Notification, NotificationType } from "../models/Notification";
import { Types } from "mongoose";

interface CreateNotificationInput {
  userId: string | Types.ObjectId;
  groupId?: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return Notification.create(input);
}

export async function listUserNotifications(userId: string) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  );
}
