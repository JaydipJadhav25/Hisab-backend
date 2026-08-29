import { Schema } from "mongoose";

/**
 * Applies a consistent JSON shape across all models:
 * - exposes Mongo's _id as a plain "id" string (what the frontend expects)
 * - drops _id and __v from API responses
 * Call once per schema, e.g. `applyIdTransform(groupSchema)`.
 */
export function applyIdTransform(schema: Schema, extraFieldsToDelete: string[] = []) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      extraFieldsToDelete.forEach((field) => delete ret[field]);
      return ret;
    },
  });
}
