import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AuthenticatedRequest,
  sanitizeForLog,
  toLogMessage,
} from '../logging.utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : undefined;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>)?.message ||
          (exception instanceof Error
            ? exception.message
            : 'Internal server error');

    this.logger.error(
      toLogMessage('http.request.failed', {
        requestId: request?.requestId,
        method: request?.method,
        url: request?.originalUrl ?? request?.url,
        ip: request?.ip,
        userId: request?.user?.userId,
        statusCode: status,
        params: sanitizeForLog(request?.params),
        query: sanitizeForLog(request?.query),
        body: sanitizeForLog(request?.body),
        error: sanitizeForLog(
          exception instanceof Error
            ? exception
            : { message: 'Non-error exception thrown', value: exception },
        ),
      }),
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}
