import express, { Application, Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import httpContext from "express-http-context";

Sentry.init({
  dsn: "your project dsn",
  // debug: true, #Integrationの内訳などを確認したいときなど
  // environment: process.env.NODE_ENV #そもそも環境はdsn単位で別にしたい
});

const app: Application = express();
const PORT = 3000;

app.use(httpContext.middleware);

app.use((req, res, next) => {
  const traceId = crypto.randomUUID();
  httpContext.set("traceId", traceId);
  res.setHeader("x-traceId", traceId);
  next();
});

app.get("/", (req, res, next) => {
  try {
    throw new Error("2024-06-12 22:37");
  } catch (error) {
    next(error);
  }
});

// Sentry.setupExpressErrorHandler(app);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });

  Sentry.captureException(err, (s) => {
    s.setLevel("fatal");
    s.setTag("app-traceId", httpContext.get("traceId"));
    return s;
  });
});

try {
  app.listen(PORT, () => {
    console.log(`server running at://localhost:${PORT}`);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
