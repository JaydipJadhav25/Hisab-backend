import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(AppError.unauthorized("Authentication required"));
  }

  try {
    const payload = verifyToken(token);
    console.log("payload  : " , payload);
    req.userId = payload.sub;
    next();
  } catch {
    next(AppError.unauthorized("Invalid session. Please log in again."));
  }
}
