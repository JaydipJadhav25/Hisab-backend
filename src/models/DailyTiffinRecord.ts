import { Schema, model, Document, Types } from "mongoose";

export type TiffinType = "FULL" | "HALF" | "NONE";
export type TiffinRecordStatus = "CONFIRMED" | "LOCKED" | "ADMIN_OVERRIDDEN";

export interface IDailyTiffinRecord extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // "YYYY-MM-DD", stored as a string for simple uniqueness + querying
  type: TiffinType;
  priceAtTime: number;
  status: TiffinRecordStatus;
  confirmedAt: Date;
  updatedAt: Date;
  createdAt: Date;
}

const dailyTiffinRecordSchema = new Schema<IDailyTiffinRecord>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ["FULL", "HALF", "NONE"], required: true },
    priceAtTime: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["CONFIRMED", "LOCKED", "ADMIN_OVERRIDDEN"],
      default: "CONFIRMED",
    },
    confirmedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

// Rule: only one active tiffin record per member/group/date
dailyTiffinRecordSchema.index({ groupId: 1, userId: 1, date: 1 }, { unique: true });
dailyTiffinRecordSchema.index({ groupId: 1, date: 1 });

export const DailyTiffinRecord = model<IDailyTiffinRecord>(
  "DailyTiffinRecord",
  dailyTiffinRecordSchema
);
