import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/requireAuth";
import {
  createGroupSchema,
  updateGroupSchema,
  joinGroupSchema,
  renewGroupSchema,
} from "../validators/group.validators";
import * as groupService from "../services/group.service";
import { computeGroupStatus } from "../services/group.service";


export const createGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = createGroupSchema.parse(req.body);
  console.log("log : " ,input);

  const group = await groupService.createGroup(req.userId as string, input);

  console.log("group: " , group);


  res.status(201).json({ group });

  
});

export const listMyGroups = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groups = await groupService.getUserGroups(req.userId as string);
  res.status(200).json({
    groups: groups.map(({ group, role }) => ({
      ...group.toJSON(),
      status: computeGroupStatus(group),
      role,
    })),
  });
});

export const getGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const group = await groupService.getGroupOr404(req.params.id);
  res.status(200).json({ group: { ...group.toJSON(), status: computeGroupStatus(group) } });
});

export const updateGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = updateGroupSchema.parse(req.body);
  const group = await groupService.updateGroup(req.params.id, input);
  res.status(200).json({ group });
});

export const joinGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = joinGroupSchema.parse(req.body);
  const { group } = await groupService.joinGroupByCode(req.userId as string, input.inviteCode);
  res.status(200).json({ group });
});

export const listMembers = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const members = await groupService.listMembers(req.params.id);
  res.status(200).json({ members });
});

export const removeMember = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await groupService.removeMember(req.params.id, req.params.userId);
  res.status(200).json({ message: "Member removed" });
});

export const closeGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const group = await groupService.closeGroup(req.params.id);
  res.status(200).json({ group });
});

export const renewGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = renewGroupSchema.parse(req.body);
  const group = await groupService.renewGroup(req.params.id, input.duration, input.endDate);
  res.status(201).json({ group });
});
