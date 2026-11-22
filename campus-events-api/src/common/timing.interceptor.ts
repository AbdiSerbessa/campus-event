import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable, tap } from "rxjs";

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    console.log(`[Timing] Request started: ${request.method} ${request.originalUrl}`);

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[Timing] Request completed in ${Date.now() - start}ms (${request.method} ${request.originalUrl})`
        );
      })
    );
  }
}