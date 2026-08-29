import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { GroupMember, GroupRole } from "../models/GroupMember";
import { AuthedRequest } from "./requireAuth";

export interface GroupScopedRequest extends AuthedRequest {
  groupRole?: GroupRole;
}

/**
 * Verifies the authenticated user is an active member of req.params.id (or :groupId),
 * and optionally that they hold one of the allowedRoles.
 * Attaches req.groupRole for downstream handlers.
 *
 * Wrapped defensively: any thrown/rejected error is forwarded to next(err)
 * instead of becoming an unhandled rejection that crashes the process.
 */
export function requireGroupRole(...allowedRoles: GroupRole[]) {
  return async (req: GroupScopedRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.params.groupId ?? req.params.id;
      if (!req.userId) return next(AppError.unauthorized());
      if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        return next(AppError.badRequest("Invalid or missing group id", "INVALID_GROUP_ID"));
      }

      const membership = await GroupMember.findOne({
        groupId,
        userId: req.userId,
        status: "ACTIVE",
      });

      if (!membership) {
        return next(AppError.forbidden("You are not a member of this group"));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return next(AppError.forbidden("You do not have permission to perform this action"));
      }

      req.groupRole = membership.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
