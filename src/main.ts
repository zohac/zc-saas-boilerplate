import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
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

  // --- Configuration de Swagger ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ZC SaaS Boilerplate API')
    .setDescription('API Documentation for the ZC SaaS Boilerplate application')
    .setVersion('1.0')
    // Ajouter des tags pour organiser les endpoints (optionnel mais recommandé)
    .addTag('Auth', 'Authentication related endpoints')
    .addTag('Users', 'User management endpoints')
    // Configurer l'authentification Bearer (JWT) pour Swagger UI
    .addBearerAuth(
      {
        // I typically use Bearer (JWT) scheme
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // Le nom utilisé pour référencer cette sécurité (ex: dans @ApiBearerAuth())
    )
    .build(); // Construire l'objet de configuration

  // Créer le document OpenAPI basé sur l'application et la configuration
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Mettre en place le serveur Swagger UI sur un chemin spécifique
  const swaggerPath = 'api-docs'; // Chemin d'accès (ex: /api-docs)
  SwaggerModule.setup(swaggerPath, app, document);

  // Add "/api" before all routes
  app.setGlobalPrefix('api');

  // --- Enregistrer le filtre d'exception global ---
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // --- Swagger (sera configuré plus tard) ---

  await app.listen(port);
}
bootstrap();
