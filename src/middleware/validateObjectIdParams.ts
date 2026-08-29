import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

/**
 * Rejects requests where any of the given route params isn't a valid Mongo
 * ObjectId, before the value ever reaches a query. Prevents CastError from
 * escaping as an unhandled rejection inside async route handlers.
 */
export function validateObjectIdParams(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return next(AppError.badRequest(`Invalid ${name}`, "INVALID_ID"));
      }
    }
    next();
  };
}
