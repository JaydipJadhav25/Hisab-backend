import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string; // userId
}

/**
 * Single, long-lived token — no expiry, no refresh token.
 * Simple by design: the client stores this in localStorage and sends it
 * as `Authorization: Bearer <token>` on every request.
 */
export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET);
}

export function verifyToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}
