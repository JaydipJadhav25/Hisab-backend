import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as notificationController from "../controllers/notification.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List the current user's notifications
 *     tags: [Notifications]
 *     responses:
 *       200: { description: Notification list }
 */
router.get("/", notificationController.listNotifications);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     responses:
 *       200: { description: Notification updated }
 */
router.patch("/:id/read", notificationController.markRead);

export default router;
