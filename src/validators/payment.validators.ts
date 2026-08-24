import { z } from "zod";

export const recordPaymentSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "OTHER"]).default("CASH"),
  note: z.string().trim().max(280).optional(),
  paymentDate: z.coerce.date().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
