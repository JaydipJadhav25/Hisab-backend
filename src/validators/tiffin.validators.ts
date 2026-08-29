import { z } from "zod";

export const selectTiffinSchema = z.object({
  type: z.enum(["FULL", "HALF", "NONE"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // defaults to today; admin override may target a specific date
});

export type SelectTiffinInput = z.infer<typeof selectTiffinSchema>;
