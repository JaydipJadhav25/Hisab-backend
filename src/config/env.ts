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
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET", "dev_access_secret"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET", "dev_refresh_secret"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "localhost",
  isProd: (process.env.NODE_ENV ?? "development") === "production",
};
