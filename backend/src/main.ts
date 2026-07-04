import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const corsOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  app.use('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      database: 'unchecked',
      redis: process.env.REDIS_URL ? 'configured' : 'not_configured',
      time: new Date().toISOString()
    });
  });
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Agri Passport API')
    .setDescription('Mobile-first SaaS API for cooperatives and traceability passports')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
