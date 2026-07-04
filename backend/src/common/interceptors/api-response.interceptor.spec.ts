import { StreamableFile } from '@nestjs/common';
import { of } from 'rxjs';
import { Readable } from 'stream';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
  it('does not wrap StreamableFile downloads', async () => {
    const interceptor = new ApiResponseInterceptor();
    const file = new StreamableFile(Readable.from(['backup']));
    const result = await new Promise((resolve) => {
      interceptor
        .intercept({} as never, { handle: () => of(file) })
        .subscribe((value) => resolve(value));
    });

    expect(result).toBe(file);
  });
});
