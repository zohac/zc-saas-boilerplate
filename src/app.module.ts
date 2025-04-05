import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Charger ConfigModule globalement
    ConfigModule.forRoot({
      isGlobal: true, // Rend ConfigService disponible partout
      envFilePath: '.env', // Spécifie le fichier .env à charger (par défaut, mais explicite c'est bien)
      // ignoreEnvFile: false, // Mettre à true si vous voulez UNIQUEMENT utiliser les variables système
      // cache: true, // Active la mise en cache des variables pour de meilleures perfs
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
