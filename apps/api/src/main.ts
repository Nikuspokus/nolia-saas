import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Préfixe API : Toutes les routes commenceront par /api
  app.setGlobalPrefix('api');

  // 2. Validation des données entrantes (DTO)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 3. CORS : Autoriser le Front-end spécifiquement (Sécurité + Fonctionnement)
  app.enableCors({
    origin: [
      'https://nolia-saas-web.vercel.app', // Votre URL de production Front
      'http://localhost:3000',             // Pour vos tests locaux
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. Port : Vercel fournit le port via process.env.PORT
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
