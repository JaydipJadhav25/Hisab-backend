import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/requireAuth";
import * as notificationService from "../services/notification.service";

export const listNotifications = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notifications = await notificationService.listUserNotifications(req.userId as string);
  res.status(200).json({ notifications });
});

export const markRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notification = await notificationService.markNotificationRead(
    req.userId as string,
    req.params.id
  );
  res.status(200).json({ notification });
});
