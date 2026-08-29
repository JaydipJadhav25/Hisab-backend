import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  MONGO_URI: required("MONGO_URI", "mongodb://127.0.0.1:27017/hisab"),
  JWT_SECRET: required("JWT_SECRET", "dev_secret_change_me"),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  isProd: (process.env.NODE_ENV ?? "development") === "production",
};
