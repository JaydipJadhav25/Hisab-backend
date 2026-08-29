import { Payment } from "../models/Payment";
import { RecordPaymentInput } from "../validators/payment.validators";
import { createNotification } from "./notification.service";

export async function recordPayment(groupId: string, recordedBy: string, input: RecordPaymentInput) {
  const payment = await Payment.create({
    groupId,
    userId: input.userId,
    amount: input.amount,
    method: input.method,
    note: input.note,
    paymentDate: input.paymentDate ?? new Date(),
    recordedBy,
  });

  await createNotification({
    userId: input.userId,
    groupId,
    type: "PAYMENT_PENDING",
    title: "Payment recorded",
    body: `A payment of ₹${input.amount} was recorded for you.`,
  });

  return payment;
}

export async function listGroupPayments(groupId: string) {
  return Payment.find({ groupId }).sort({ paymentDate: -1 });
}

export async function listMemberPayments(groupId: string, userId: string) {
  return Payment.find({ groupId, userId }).sort({ paymentDate: -1 });
}
