import { Schema, model, Document, Types } from "mongoose";

export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "OTHER";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  note?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, default: () => new Date() },
    method: {
      type: String,
      enum: ["CASH", "UPI", "BANK_TRANSFER", "OTHER"],
      default: "CASH",
    },
    note: { type: String, maxlength: 280 },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

paymentSchema.index({ groupId: 1, userId: 1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
