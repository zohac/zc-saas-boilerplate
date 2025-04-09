import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from "@shared/common/filters/all-exceptions.filter";
import helmet from "helmet";
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
// --- Obtenir l'instance HttpAdapterHost ---
  const httpAdapterHost = app.get(HttpAdapterHost);
  // --- Récupérer ConfigService (possible car ConfigModule est global) ---
  const configService = app.get(ConfigService);

  // --- Lire le PORT depuis la configuration ---
  const port = configService.get<number>('PORT', 3000); // Utilise 3000 si PORT non trouvé

  // --- Configurations de Sécurité Globales ---

  // 1. Activer CORS
  app.enableCors({
    // Configurez ici les options CORS de manière plus stricte en production !
    // origin: 'https://votre-frontend.com', // Autoriser uniquement votre frontend
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // allowedHeaders: 'Content-Type, Accept, Authorization',
    // credentials: true, // Si vous avez besoin d'envoyer des cookies/auth headers
    origin: true, // Pour le développement, autorise l'origine de la requête (peut être '*' ou true) - A CHANGER EN PRODUCTION
  });

  // 2. Appliquer Helmet pour les en-têtes de sécurité
  app.use(helmet());
  // Vous pouvez personnaliser Helmet ici si nécessaire, par ex. pour CSP :
  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       scriptSrc: ["'self'", "'unsafe-inline'"], // Exemple, à adapter
  //       // ... autres directives
  //     },
  //   },
  // }));

  // --- Configurations globales ---
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Add "/api" before all routes
  app.setGlobalPrefix('api');

  // --- Enregistrer le filtre d'exception global ---
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // --- Swagger (sera configuré plus tard) ---

  await app.listen(port);
}
bootstrap();
