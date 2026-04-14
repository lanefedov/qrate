import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  AuthenticatedRequest,
  sanitizeForLog,
  toLogMessage,
} from '../logging.utils';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();
    const requestId = request.requestId ?? randomUUID();
    const startedAt = Date.now();

    request.requestId = requestId;

    this.logger.log(
      toLogMessage('http.request.started', {
        requestId,
        method: request.method,
        url: request.originalUrl ?? request.url,
        ip: request.ip,
        userAgent: request.get('user-agent'),
        userId: request.user?.userId,
        params: sanitizeForLog(request.params),
        query: sanitizeForLog(request.query),
        body: sanitizeForLog(request.body),
      }),
    );

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(
          toLogMessage('http.request.completed', {
            requestId,
            method: request.method,
            url: request.originalUrl ?? request.url,
            userId: request.user?.userId,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
            response: sanitizeForLog(data),
          }),
        );
      }),
    );
  }
}
