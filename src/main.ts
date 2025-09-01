import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
