import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import * as handler from "./handler";
import * as Sentry from "@sentry/node";
import httpContext from "express-http-context";

import "./instrument";

const app: Application = express();
const PORT = 3000;

app.use(httpContext.middleware);
app.use(cors({ origin: "http://localhost:5173" }));

app.use((req, res, next) => {
  const traceId = crypto.randomUUID();
  httpContext.set("traceId", traceId);
  res.setHeader("x-traceId", traceId);
  next();
});

app.get("/test1", handler.test1);
app.get("/test2", handler.test2);

// Sentry.setupExpressErrorHandler(app);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });

  Sentry.captureException(err, (s) => {
    s.setLevel("fatal");
    s.setTag("app-traceId", httpContext.get("traceId"))
    return s;
  });

  // エラーをコンソールにログ出力（開発中のみ）
  if (app.get("env") === "development") {
    console.error(err);
  }
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
