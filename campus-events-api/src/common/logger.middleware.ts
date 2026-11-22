import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const time = new Date().toISOString().split("T")[1].slice(0, 8);
    console.log(`[Logger] ${req.method} ${req.originalUrl} at ${time}`);
    next();
  }
}