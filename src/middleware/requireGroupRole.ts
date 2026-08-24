import { NextFunction, Response } from "express";
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
 */
export function requireGroupRole(...allowedRoles: GroupRole[]) {
  return async (req: GroupScopedRequest, res: Response, next: NextFunction) => {
    const groupId = req.params.groupId ?? req.params.id;
    if (!req.userId) return next(AppError.unauthorized());
    if (!groupId) return next(AppError.badRequest("Missing group id"));

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
  };
}
