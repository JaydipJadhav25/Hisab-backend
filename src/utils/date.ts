/**
 * Returns today's date as "YYYY-MM-DD" (server-local time).
 * Kept centralised so the whole app agrees on "today".
 */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPastCutoff(cutoffTime: string): boolean {
  const [h, m] = cutoffTime.split(":").map(Number);
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(h, m, 0, 0);
  return now.getTime() > cutoff.getTime();
}

export function addDuration(start: Date, duration: string): Date {
  const end = new Date(start);
  switch (duration) {
    case "1_WEEK":
      end.setDate(end.getDate() + 7);
      break;
    case "2_WEEKS":
      end.setDate(end.getDate() + 14);
      break;
    case "1_MONTH":
      end.setMonth(end.getMonth() + 1);
      break;
    case "3_MONTHS":
      end.setMonth(end.getMonth() + 3);
      break;
    default:
      break; // CUSTOM: caller supplies endDate explicitly
  }
  return end;
}
