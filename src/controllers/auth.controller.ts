import { asyncHandler } from "../utils/asyncHandler";
import { registerSchema, loginSchema } from "../validators/auth.validators";
import { registerUser, validateCredentials } from "../services/auth.service";
import { signToken } from "../utils/jwt";
import { AuthedRequest } from "../middleware/requireAuth";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

// Simple by design: token is returned in the response body, the client
// stores it in localStorage, and sends it back as `Authorization: Bearer <token>`.
// No cookies, no refresh token, no expiry.

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  const token = signToken(user._id.toString());
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await validateCredentials(input);
  const token = signToken(user._id.toString());
  res.status(200).json({ user, token });
});

export const logout = asyncHandler(async (_req, res) => {
  // Nothing to invalidate server-side with a single non-expiring token —
  // the client just deletes it from localStorage.
  res.status(200).json({ message: "Logged out" });
});

export const me = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw AppError.notFound("User not found");
  res.status(200).json({ user });
});
