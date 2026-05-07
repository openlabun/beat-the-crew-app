import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Beat The Crew API')
    .setDescription('API documentation for the Beat The Crew application')
    .setVersion('1.0')
      .addBearerAuth(
      {
        type: 'apiKey',
        name: 'access_token',
        in: 'cookie',
        description: 'JWT access token stored in HTTP-only cookie. Set automatically after login.',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
