import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Increase payload size limit for image uploads
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

  // All routes start with /api
  app.setGlobalPrefix('api');

  // Allow frontend to hit the API in dev
  app.enableCors();

  // Class-validator on DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      forbidNonWhitelisted: true, // throws on unknown fields
      transform: true, // auto-transform payloads to DTO types
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
