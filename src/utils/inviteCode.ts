import { randomBytes } from "crypto";

/**
 * Generates a short, human-shareable invite code like "KAKU-7F29".
 */
export function generateInviteCode(groupName: string): string {
  const prefix = groupName
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const suffix = randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  return `${prefix}-${suffix}`;
}
