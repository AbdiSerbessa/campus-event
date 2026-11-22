import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredKey = process.env.CLASSROOM_API_KEY;
    if (!requiredKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers["x-api-key"];

    if (!providedKey || providedKey !== requiredKey) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }
}