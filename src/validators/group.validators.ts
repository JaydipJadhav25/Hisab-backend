import { z } from "zod";

export const durationEnum = z.enum(["1_WEEK", "2_WEEKS", "1_MONTH", "3_MONTHS", "CUSTOM"]);

export const createGroupSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    provider: z.object({
      name: z.string().trim().min(2).max(80),
      phone: z.string().trim().min(7).max(15),
      address: z.string().trim().max(200).optional(),
      notes: z.string().trim().max(280).optional(),
    }),
    pricing: z
      .object({
        full: z.number().positive(),
        half: z.number().positive(),
      })
      .refine((p) => p.half <= p.full, {
        message: "Half price should normally be less than or equal to full price",
        path: ["half"],
      }),
    startDate: z.coerce.date(),
    duration: durationEnum,
    endDate: z.coerce.date().optional(),
    cutoffTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "cutoffTime must be HH:mm")
      .default("09:00"),
  })
  .refine((data) => data.duration !== "CUSTOM" || !!data.endDate, {
    message: "endDate is required when duration is CUSTOM",
    path: ["endDate"],
  });

export const updateGroupSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  provider: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      phone: z.string().trim().min(7).max(15).optional(),
      address: z.string().trim().max(200).optional(),
      notes: z.string().trim().max(280).optional(),
    })
    .optional(),
  pricing: z
    .object({
      full: z.number().positive().optional(),
      half: z.number().positive().optional(),
    })
    .optional(),
  cutoffTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "cutoffTime must be HH:mm")
    .optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().trim().min(4).max(20),
});

export const renewGroupSchema = z.object({
  duration: durationEnum,
  endDate: z.coerce.date().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
