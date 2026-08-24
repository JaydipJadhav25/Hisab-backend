import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

type AnySchema = AnyZodObject | ZodEffects<any>;

export function validateBody(schema: AnySchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}
