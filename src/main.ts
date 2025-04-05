import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(port);

  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
