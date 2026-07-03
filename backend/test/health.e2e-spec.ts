import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthController } from '../src/modules/health/health.controller';
import { HealthService } from '../src/modules/health/health.service';

describe('Health API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              database: 'ok',
              redis: 'configured',
              time: new Date('2026-01-01T00:00:00Z').toISOString()
            })
          }
        }
      ]
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns health status', async () => {
    await request(app.getHttpServer()).get('/health').expect(200).expect((response) => {
      expect(response.body.status).toBe('ok');
    });
  });
});
