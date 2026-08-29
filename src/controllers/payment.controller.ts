import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { GroupScopedRequest } from "../middleware/requireGroupRole";
import { recordPaymentSchema } from "../validators/payment.validators";
import * as paymentService from "../services/payment.service";

export const recordPayment = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const input = recordPaymentSchema.parse(req.body);
  const payment = await paymentService.recordPayment(req.params.id, req.userId as string, input);
  res.status(201).json({ payment });
});

export const listPayments = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const payments = await paymentService.listGroupPayments(req.params.id);
  res.status(200).json({ payments });
});

export const listMyPayments = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const payments = await paymentService.listMemberPayments(req.params.id, req.userId as string);
  res.status(200).json({ payments });
});

export const listMemberPayments = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const targetUserId =
    req.groupRole === "ADMIN" ? req.params.userId : (req.userId as string);
  const payments = await paymentService.listMemberPayments(req.params.id, targetUserId);
  res.status(200).json({ payments });
});
