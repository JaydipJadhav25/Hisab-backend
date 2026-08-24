import { Router } from "express";
import * as groupController from "../controllers/group.controller";
import * as tiffinController from "../controllers/tiffin.controller";
import * as hisabController from "../controllers/hisab.controller";
import * as paymentController from "../controllers/payment.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireGroupRole } from "../middleware/requireGroupRole";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     responses:
 *       201: { description: Group created }
 *   get:
 *     summary: List groups the current user belongs to
 *     tags: [Groups]
 *     responses:
 *       200: { description: List of groups }
 */
router.post("/", groupController.createGroup);
router.get("/", groupController.listMyGroups);

/**
 * @openapi
 * /groups/join:
 *   post:
 *     summary: Join a group using an invite code
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inviteCode]
 *             properties:
 *               inviteCode: { type: string }
 *     responses:
 *       200: { description: Joined group }
 */
router.post("/join", groupController.joinGroup);

/**
 * @openapi
 * /groups/{id}:
 *   get:
 *     summary: Get a group's details
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Group details }
 *   patch:
 *     summary: Update group settings (admin only)
 *     tags: [Groups]
 *     responses:
 *       200: { description: Updated group }
 */
router.get("/:id", requireGroupRole(), groupController.getGroup);
router.patch("/:id", requireGroupRole("ADMIN"), groupController.updateGroup);

/**
 * @openapi
 * /groups/{id}/members:
 *   get:
 *     summary: List a group's active members
 *     tags: [Members]
 *     responses:
 *       200: { description: Member list }
 */
router.get("/:id/members", requireGroupRole(), groupController.listMembers);

/**
 * @openapi
 * /groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the group (admin only)
 *     tags: [Members]
 *     responses:
 *       200: { description: Member removed }
 */
router.delete(
  "/:id/members/:userId",
  requireGroupRole("ADMIN"),
  groupController.removeMember
);

/**
 * @openapi
 * /groups/{id}/close:
 *   post:
 *     summary: Close a group (admin only)
 *     tags: [Groups]
 *     responses:
 *       200: { description: Group closed }
 */
router.post("/:id/close", requireGroupRole("ADMIN"), groupController.closeGroup);

/**
 * @openapi
 * /groups/{id}/renew:
 *   post:
 *     summary: Renew a group for a new period, preserving history (admin only)
 *     tags: [Groups]
 *     responses:
 *       201: { description: New group period created }
 */
router.post("/:id/renew", requireGroupRole("ADMIN"), groupController.renewGroup);

/**
 * @openapi
 * /groups/{id}/tiffin/today:
 *   post:
 *     summary: Select or update today's tiffin
 *     tags: [Tiffin]
 *     responses:
 *       200: { description: Selection saved }
 *   get:
 *     summary: Get the current user's today selection
 *     tags: [Tiffin]
 *     responses:
 *       200: { description: Today's record, if any }
 */
router.post("/:id/tiffin/today", requireGroupRole(), tiffinController.selectToday);
router.get("/:id/tiffin/today", requireGroupRole(), tiffinController.getToday);

/**
 * @openapi
 * /groups/{id}/tiffin/order:
 *   get:
 *     summary: Get the aggregated order for a date (defaults to today)
 *     tags: [Tiffin]
 *     responses:
 *       200: { description: Order summary }
 */
router.get("/:id/tiffin/order", requireGroupRole(), tiffinController.getTodayOrder);

/**
 * @openapi
 * /groups/{id}/tiffin/history:
 *   get:
 *     summary: Get the group's daily tiffin history (filterable)
 *     tags: [Tiffin]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { $ref: '#/components/schemas/TiffinType' }
 *     responses:
 *       200: { description: Filtered history }
 */
router.get("/:id/tiffin/history", requireGroupRole(), tiffinController.getHistory);

/**
 * @openapi
 * /groups/{id}/tiffin/{userId}/override:
 *   patch:
 *     summary: Admin override of a member's tiffin selection
 *     tags: [Tiffin]
 *     responses:
 *       200: { description: Selection overridden }
 */
router.patch(
  "/:id/tiffin/:userId/override",
  requireGroupRole("ADMIN"),
  tiffinController.overrideSelection
);

/**
 * @openapi
 * /groups/{id}/hisab:
 *   get:
 *     summary: Get the whole group's hisab (admin only)
 *     tags: [Hisab]
 *     responses:
 *       200: { description: Group hisab }
 */
router.get("/:id/hisab", requireGroupRole("ADMIN"), hisabController.getGroupHisab);

/**
 * @openapi
 * /groups/{id}/hisab/{userId}:
 *   get:
 *     summary: Get one member's hisab (self, or admin for anyone)
 *     tags: [Hisab]
 *     responses:
 *       200: { description: Member hisab }
 */
router.get("/:id/hisab/:userId", requireGroupRole(), hisabController.getMemberHisab);

/**
 * @openapi
 * /groups/{id}/payments:
 *   post:
 *     summary: Record a payment (admin only)
 *     tags: [Payments]
 *     responses:
 *       201: { description: Payment recorded }
 *   get:
 *     summary: List all payments in a group (admin only)
 *     tags: [Payments]
 *     responses:
 *       200: { description: Payment list }
 */
router.post("/:id/payments", requireGroupRole("ADMIN"), paymentController.recordPayment);
router.get("/:id/payments", requireGroupRole("ADMIN"), paymentController.listPayments);

/**
 * @openapi
 * /groups/{id}/payments/{userId}:
 *   get:
 *     summary: List a member's payments (self, or admin for anyone)
 *     tags: [Payments]
 *     responses:
 *       200: { description: Payment list }
 */
router.get("/:id/payments/:userId", requireGroupRole(), paymentController.listMemberPayments);

export default router;
