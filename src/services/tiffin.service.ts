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
  // console.log("group id : " , group);

  const status = computeGroupStatus(group);
  // console.log("status : " , status);
  if (status === "EXPIRED" || status === "CLOSED") {
    throw AppError.badRequest("This group has ended. New selections are not accepted.", "GROUP_EXPIRED");
  }



  const date = targetDate ?? todayISODate();

  // console.log("date : " , date);

  // 1. Get the current hour based on system execution time
  const currentHour = new Date().getHours(); 

  // console.log("currentHour : " , currentHour);


  // 2. Determine mode: "day" (9 AM to 5:59 PM) vs "night" (6 PM to 8:59 AM)
  const mode = (currentHour >= 9 && currentHour < 18) ? "day" : "night";

  const price = priceForType(type, group.pricing);


 


  // 3. Always create a new historic entry with the mode saved
  const record = await DailyTiffinRecord.create({
    groupId,
    userId,
    date,
    type,
    mode, // Saves "day" or "night" into the document
    priceAtTime: price,
    status: isAdminOverride ? "ADMIN_OVERRIDDEN" : "CONFIRMED",
    confirmedAt: new Date(),
  });



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

export async function getGroupHistory( groupId : any , userId : any ) {

   const records = await DailyTiffinRecord.find({ groupId, userId });


    // console.log("recors : " , records);

    return records;
}


export interface DayCalendarSummary {
  date: string; // YYYY-MM-DD
  full: number;
  half: number;
  none: number;
  responded: number;
}

/**
 * One row per date-with-at-least-one-record, for a given month, used to
 * draw badges on the calendar. `month` is "YYYY-MM".
 */
export async function getMonthCalendarSummary(
  groupId: string,
  month: string
): Promise<DayCalendarSummary[]> {
  const prefix = month; // "YYYY-MM" is a valid prefix of "YYYY-MM-DD"
  const records = await DailyTiffinRecord.find({
    groupId,
    date: { $regex: `^${prefix}` },
  });

  const byDate = new Map<string, DayCalendarSummary>();
  for (const r of records) {
    const existing =
      byDate.get(r.date) ?? { date: r.date, full: 0, half: 0, none: 0, responded: 0 };
    if (r.type === "FULL") existing.full += 1;
    else if (r.type === "HALF") existing.half += 1;
    else existing.none += 1;
    existing.responded += 1;
    byDate.set(r.date, existing);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
