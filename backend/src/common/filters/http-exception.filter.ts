import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';

type ValidationErrorShape = {
  field?: string;
  message: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const isProduction = process.env.NODE_ENV === 'production';

    const errors: ValidationErrorShape[] = [];
    let message = 'Internal server error';

    if (typeof payload === 'string') {
      message = payload;
    } else if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      if (typeof record.message === 'string') {
        message = record.message;
      }
      if (Array.isArray(record.message)) {
        message = 'Validation failed';
        for (const item of record.message) {
          errors.push({ message: String(item) });
        }
      }
      if (Array.isArray(record.errors)) {
        for (const item of record.errors) {
          if (typeof item === 'object' && item) {
            const entry = item as Record<string, unknown>;
            errors.push({
              field: typeof entry.field === 'string' ? entry.field : undefined,
              message: String(entry.message ?? 'Invalid value')
            });
          }
        }
      }
    } else if (exception instanceof Error && !isProduction) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      errors,
      meta: {
        statusCode: status,
        time: new Date().toISOString()
      }
    });
  }
}
