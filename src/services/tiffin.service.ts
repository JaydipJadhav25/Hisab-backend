import { DailyTiffinRecord, TiffinType } from "../models/DailyTiffinRecord";
import { Group } from "../models/Group";
import { AppError } from "../utils/AppError";
import { isPastCutoff, todayISODate } from "../utils/date";
import { computeGroupStatus } from "./group.service";

function priceForType(type: TiffinType, pricing: { full: number; half: number }): number {
  if (type === "FULL") return pricing.full;
  if (type === "HALF") return pricing.half;
  return 0;
}

export async function selectTodayTiffin(
  groupId: string,
  userId: string,
  type: TiffinType,
  isAdminOverride: boolean,
  targetDate?: string
) {
  const group = await Group.findById(groupId);
  if (!group) throw AppError.notFound("Group not found", "GROUP_NOT_FOUND");

  const status = computeGroupStatus(group);
  if (status === "EXPIRED" || status === "CLOSED") {
    throw AppError.badRequest("This group has ended. New selections are not accepted.", "GROUP_EXPIRED");
  }

  const date = targetDate ?? todayISODate();

  if (!isAdminOverride && date === todayISODate() && isPastCutoff(group.cutoffTime)) {
    throw AppError.forbidden(
      `Selection is locked. Today's cutoff was ${group.cutoffTime}.`,
      "CUTOFF_PASSED"
    );
  }

  const price = priceForType(type, group.pricing);

  const record = await DailyTiffinRecord.findOneAndUpdate(
    { groupId, userId, date },
    {
      $set: {
        type,
        priceAtTime: price,
        status: isAdminOverride ? "ADMIN_OVERRIDDEN" : "CONFIRMED",
        confirmedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return record;
}

export async function getTodayRecord(groupId: string, userId: string) {
  return DailyTiffinRecord.findOne({ groupId, userId, date: todayISODate() });
}

export async function getGroupOrderForDate(groupId: string, date: string) {
  const records = await DailyTiffinRecord.find({ groupId, date }).populate(
    "userId",
    "name profileImage"
  );

  const summary = { FULL: 0, HALF: 0, NONE: 0 };
  records.forEach((r) => {
    summary[r.type] += 1;
  });

  return { date, summary, records };
}

export async function getGroupHistory(
  groupId: string,
  filters: { date?: string; userId?: string; type?: TiffinType }
) {
  const query: Record<string, unknown> = { groupId };
  if (filters.date) query.date = filters.date;
  if (filters.userId) query.userId = filters.userId;
  if (filters.type) query.type = filters.type;

  return DailyTiffinRecord.find(query)
    .sort({ date: -1 })
    .populate("userId", "name profileImage");
}
