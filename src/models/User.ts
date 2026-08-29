import { Schema, model, Document, Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type Language = "en" | "mr";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  preferredLanguage: Language;
  profileImage?: string;
  bio?: string;
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    preferredLanguage: { type: String, enum: ["en", "mr"], default: "en" },
    profileImage: { type: String },
    bio: { type: String, maxlength: 280 },
    occupation: { type: String, maxlength: 80 },
  },
  { timestamps: true }
);

applyIdTransform(userSchema, ["passwordHash"]);

export const User = model<IUser>("User", userSchema);
