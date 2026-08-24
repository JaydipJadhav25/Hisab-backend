import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.isProd ? "combined" : "dev"));

app.get("/", (_req, res) => {
  res.json({
    message: "Backend is running",
    url : process.env.CLIENT_ORIGIN
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
