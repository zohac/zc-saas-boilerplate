import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from "@shared/common/filters/all-exceptions.filter";
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
// --- Obtenir l'instance HttpAdapterHost ---
  const httpAdapterHost = app.get(HttpAdapterHost);
  // --- Récupérer ConfigService (possible car ConfigModule est global) ---
  const configService = app.get(ConfigService);

  // --- Lire le PORT depuis la configuration ---
  const port = configService.get<number>('PORT', 3000); // Utilise 3000 si PORT non trouvé

  // --- Configurations globales ---
  app.enableCors();
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
