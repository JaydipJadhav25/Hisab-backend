import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { GroupScopedRequest } from "../middleware/requireGroupRole";
import { computeGroupHisab, computeMemberHisab } from "../services/hisab.service";

export const getGroupHisab = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const hisab = await computeGroupHisab(req.params.id);
  res.status(200).json({ hisab });
});

export const getMyHisab = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const hisab = await computeMemberHisab(req.params.id, req.userId as string);
  res.status(200).json({ hisab });
});

export const getMemberHisab = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  // Members may only fetch their own hisab unless they are admin
  const targetUserId =
    req.groupRole === "ADMIN" ? req.params.userId : (req.userId as string);
  const hisab = await computeMemberHisab(req.params.id, targetUserId);
  res.status(200).json({ hisab });
});
