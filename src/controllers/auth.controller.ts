import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { registerSchema, loginSchema } from "../validators/auth.validators";
import { registerUser, validateCredentials } from "../services/auth.service";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { env } from "../config/env";
import { AuthedRequest } from "../middleware/requireAuth";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  domain: env.NODE_ENV === "production" ? env.COOKIE_DOMAIN : undefined,
};

function setAuthCookies(res: Response, userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  setAuthCookies(res, user._id.toString());
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await validateCredentials(input);
  setAuthCookies(res, user._id.toString());
  res.status(200).json({ user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.status(200).json({ message: "Logged out" });
});

export const me = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw AppError.notFound("User not found");
  res.status(200).json({ user });
});
