import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: "Route not found", code: "ROUTE_NOT_FOUND" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }

  // Mongo duplicate key error
  if (typeof err === "object" && err !== null && (err as any).code === 11000) {
    return res.status(409).json({ message: "Duplicate record", code: "DUPLICATE" });
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);

  return res.status(500).json({
    message: "Something went wrong. Please try again.",
    code: "INTERNAL_ERROR",
    ...(env.isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
