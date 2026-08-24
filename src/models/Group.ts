import { Schema, model, Document, Types } from "mongoose";

export type GroupStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "CLOSED";

export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  provider: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  pricing: {
    full: number;
    half: number;
  };
  startDate: Date;
  endDate: Date;
  cutoffTime: string; // "HH:mm" 24h format
  status: GroupStatus;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String },
      notes: { type: String },
    },
    pricing: {
      full: { type: Number, required: true, min: 0 },
      half: { type: Number, required: true, min: 0 },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cutoffTime: { type: String, required: true, default: "09:00" },
    status: {
      type: String,
      enum: ["ACTIVE", "UPCOMING", "EXPIRED", "CLOSED"],
      default: "UPCOMING",
    },
    inviteCode: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const Group = model<IGroup>("Group", groupSchema);
