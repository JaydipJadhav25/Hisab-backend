import { DailyTiffinRecord } from "../models/DailyTiffinRecord";
import { Payment } from "../models/Payment";
import { GroupMember } from "../models/GroupMember";
import { User } from "../models/User";

export interface MemberHisab {
  userId: string;
  name: string;
  full: number;
  half: number;
  none: number;
  amount: number;
  paid: number;
  pending: number;
  status: "PAID" | "PARTIALLY_PAID" | "PENDING";
}

/**
 * Computes a single member's hisab (bill) for a group.
 * Amount is always derived from priceAtTime stored on each record,
 * so past prices remain correct even if the group's current pricing changes.
 */
export async function computeMemberHisab(groupId: string, userId: string): Promise<MemberHisab> {
  const records = await DailyTiffinRecord.find({ groupId, userId });
  const user = await User.findById(userId).select("name");

  const counts = { full: 0, half: 0, none: 0 };
  let amount = 0;

  records.forEach((r) => {
    amount += r.priceAtTime;
    if (r.type === "FULL") counts.full += 1;
    else if (r.type === "HALF") counts.half += 1;
    else counts.none += 1;
  });

  const payments = await Payment.find({ groupId, userId });
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pending = Math.max(amount - paid, 0);

  let status: MemberHisab["status"] = "PENDING";
  if (paid >= amount && amount > 0) status = "PAID";
  else if (paid > 0) status = "PARTIALLY_PAID";

  return {
    userId,
    name: user?.name ?? "Unknown",
    full: counts.full,
    half: counts.half,
    none: counts.none,
    amount,
    paid,
    pending,
    status,
  };
}

export async function computeGroupHisab(groupId: string): Promise<MemberHisab[]> {
  const members = await GroupMember.find({ groupId, status: "ACTIVE" });
  const results: MemberHisab[] = [];
  for (const member of members) {
    // sequential is fine at this scale; could Promise.all for larger groups
    // eslint-disable-next-line no-await-in-loop
    const hisab = await computeMemberHisab(groupId, member.userId.toString());
    results.push(hisab);
  }
  return results;
}
