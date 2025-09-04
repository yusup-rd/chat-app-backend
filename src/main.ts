import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Chat App API')
    .setDescription(
      'Real-time chat application API with user authentication and messaging',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Profile', 'User profile management endpoints')
    .addTag('Chat', 'Real-time messaging endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Chat App API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(process.env.PORT ?? 5000);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 5000}`,
  );
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${process.env.PORT ?? 5000}/api/docs`,
  );
}
bootstrap();
