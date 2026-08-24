import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "SELECTION_OPEN"
  | "ORDER_READY"
  | "SELECTION_LOCKED"
  | "HISAB_READY"
  | "PAYMENT_PENDING";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  groupId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    type: {
      type: String,
      enum: [
        "SELECTION_OPEN",
        "ORDER_READY",
        "SELECTION_LOCKED",
        "HISAB_READY",
        "PAYMENT_PENDING",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
