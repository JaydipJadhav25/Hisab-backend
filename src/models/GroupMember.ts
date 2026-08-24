import { Schema, model, Document, Types } from "mongoose";

export type GroupRole = "ADMIN" | "MEMBER";
export type MemberStatus = "ACTIVE" | "REMOVED";

export interface IGroupMember extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  role: GroupRole;
  joinedAt: Date;
  status: MemberStatus;
}

const groupMemberSchema = new Schema<IGroupMember>({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
  joinedAt: { type: Date, default: () => new Date() },
  status: { type: String, enum: ["ACTIVE", "REMOVED"], default: "ACTIVE" },
});

// A user can only have one membership record per group
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMember = model<IGroupMember>("GroupMember", groupMemberSchema);
