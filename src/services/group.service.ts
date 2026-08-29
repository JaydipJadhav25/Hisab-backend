import { Group, IGroup } from "../models/Group";
import { GroupMember } from "../models/GroupMember";
import { AppError } from "../utils/AppError";
import { generateInviteCode } from "../utils/inviteCode";
import { addDuration } from "../utils/date";
import { CreateGroupInput, UpdateGroupInput } from "../validators/group.validators";

export function computeGroupStatus(group: Pick<IGroup, "startDate" | "endDate" | "status">) {
  if (group.status === "CLOSED") return "CLOSED" as const;
  const now = new Date();
  if (now < group.startDate) return "UPCOMING" as const;
  if (now > group.endDate) return "EXPIRED" as const;
  return "ACTIVE" as const;
}

export async function createGroup(ownerId: string, input: CreateGroupInput) {
  const endDate =
    input.duration === "CUSTOM" ? (input.endDate as Date) : addDuration(input.startDate, input.duration);

  let inviteCode = generateInviteCode(input.name);
  // extremely unlikely collision, but guard anyway
  // eslint-disable-next-line no-await-in-loop
  while (await Group.exists({ inviteCode })) {
    inviteCode = generateInviteCode(input.name);
  }

  const group = await Group.create({
    name: input.name,
    ownerId,
    provider: input.provider,
    pricing: input.pricing,
    startDate: input.startDate,
    endDate,
    inviteCode,
    status: "UPCOMING",
  });

  await GroupMember.create({
    groupId: group._id,
    userId: ownerId,
    role: "ADMIN",
    status: "ACTIVE",
  });

  return group;
}

export async function getUserGroups(userId: string) {
  const memberships = await GroupMember.find({ userId, status: "ACTIVE" }).populate("groupId");
  return memberships
    .filter((m) => m.groupId)
    .map((m) => ({
      group: m.groupId as unknown as IGroup,
      role: m.role,
    }));
}

export async function getGroupOr404(groupId: string) {
  const group = await Group.findById(groupId);
  if (!group) throw AppError.notFound("Group not found", "GROUP_NOT_FOUND");
  return group;
}

export async function updateGroup(groupId: string, input: UpdateGroupInput) {
  const group = await getGroupOr404(groupId);

  if (input.name) group.name = input.name;
  if (input.provider) group.provider = { ...group.provider, ...input.provider };
  if (input.pricing) group.pricing = { ...group.pricing, ...input.pricing };

  await group.save();
  return group;
}

export async function joinGroupByCode(userId: string, inviteCode: string) {
  const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
  if (!group) throw AppError.notFound("Invalid invite code", "INVITE_INVALID");

  const existing = await GroupMember.findOne({ groupId: group._id, userId });
  if (existing) {
    if (existing.status === "ACTIVE") {
      throw AppError.conflict("You have already joined this group", "ALREADY_JOINED");
    }
    existing.status = "ACTIVE";
    existing.joinedAt = new Date();
    await existing.save();
    return { group, membership: existing };
  }

  const membership = await GroupMember.create({
    groupId: group._id,
    userId,
    role: "MEMBER",
    status: "ACTIVE",
  });

  return { group, membership };
}

export async function removeMember(groupId: string, userId: string) {
  const membership = await GroupMember.findOne({ groupId, userId });
  if (!membership) throw AppError.notFound("Member not found", "MEMBER_NOT_FOUND");
  if (membership.role === "ADMIN") {
    throw AppError.badRequest("Cannot remove the group admin", "CANNOT_REMOVE_ADMIN");
  }
  membership.status = "REMOVED";
  await membership.save();
}

export async function listMembers(groupId: string) {
  return GroupMember.find({ groupId, status: "ACTIVE" }).populate(
    "userId",
    "name email phone profileImage"
  );
}

export async function closeGroup(groupId: string) {
  const group = await getGroupOr404(groupId);
  group.status = "CLOSED";
  await group.save();
  return group;
}

export async function renewGroup(groupId: string, duration: string, customEndDate?: Date) {
  const previous = await getGroupOr404(groupId);

  const newStart = new Date(previous.endDate);
  newStart.setDate(newStart.getDate() + 1);
  const newEnd =
    duration === "CUSTOM" ? (customEndDate as Date) : addDuration(newStart, duration);

  let inviteCode = generateInviteCode(previous.name);
  // eslint-disable-next-line no-await-in-loop
  while (await Group.exists({ inviteCode })) {
    inviteCode = generateInviteCode(previous.name);
  }

  const nextGroup = await Group.create({
    name: previous.name,
    ownerId: previous.ownerId,
    provider: previous.provider,
    pricing: previous.pricing,
    startDate: newStart,
    endDate: newEnd,
    cutoffTime: previous.cutoffTime,
    inviteCode,
    status: "UPCOMING",
  });

  // Carry over active members (history stays attached to the previous group's id)
  const activeMembers = await GroupMember.find({ groupId: previous._id, status: "ACTIVE" });
  await GroupMember.insertMany(
    activeMembers.map((m) => ({
      groupId: nextGroup._id,
      userId: m.userId,
      role: m.role,
      status: "ACTIVE",
    }))
  );

  previous.status = "CLOSED";
  await previous.save();

  return nextGroup;
}
