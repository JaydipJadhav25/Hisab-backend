import { Router } from "express";
import authRoutes from "./auth.routes";
import groupRoutes from "./group.routes";
import notificationRoutes from "./notification.routes";
// import { requireAuth } from "@/middleware/requireAuth";

const router = Router();

router.use("/auth", authRoutes);
router.use("/groups",  groupRoutes);
router.use("/notifications", notificationRoutes);

export default router;
