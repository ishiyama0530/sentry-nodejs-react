import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

export const test1 = (req: Request, res: Response) => {
  setTimeout(() => {
    try {
      throw new Error("test1");
    } catch (e) {
      Sentry.captureException(e);
    }
  }, 99);

  return res.status(200).json({ message: "hello world" });
};

export const test2 = (req: Request, res: Response, next: NextFunction) => {
  try {
    throw new Error("test2/3");
  } catch (error) {
    next(error);
  }
};
