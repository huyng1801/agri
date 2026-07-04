import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (value instanceof StreamableFile) {
          return value;
        }

        if (value && typeof value === 'object' && 'success' in value) {
          return value;
        }

        if (value && typeof value === 'object' && 'data' in value && 'meta' in value) {
          return {
            success: true,
            message: 'OK',
            ...(value as Record<string, unknown>)
          };
        }

        return {
          success: true,
          message: 'OK',
          data: value ?? null,
          meta: {}
        };
      })
    );
  }
}
