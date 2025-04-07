import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    // Charger ConfigModule globalement
    ConfigModule.forRoot({
      isGlobal: true, // Rend ConfigService disponible partout
      envFilePath: '.env', // Spécifie le fichier .env à charger (par défaut, mais explicite c'est bien)
      // ignoreEnvFile: false, // Mettre à true si vous voulez UNIQUEMENT utiliser les variables système
      // cache: true, // Active la mise en cache des variables pour de meilleures perfs
    }),

    // Configuration de TypeOrmModule
    TypeOrmModule.forRootAsync({
      // ConfigModule doit être importé pour que ConfigService soit injectable ici
      // Bien qu'il soit global, l'importer explicitement est une bonne pratique dans forRootAsync
      imports: [ConfigModule],
      // La factory qui crée la configuration TypeORM
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
        console.log(`Connecting to DB: host=${configService.get<string>('DB_HOST')} port=${configService.get<number>('DB_PORT')} dbname=${configService.get<string>('DB_DATABASE')}`); // Log de débogage

        return {
          type: 'postgres', // Type de base de données
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),

          // Où trouver les entités (IMPORTANT)
          // Option 1: autoLoadEntities (plus simple, recommandé pour boilerplate)
          // NestJS scannera les modules enregistrés pour trouver les entités
          // si TypeOrmModule.forFeature est utilisé dans ces modules.
          autoLoadEntities: true,

          // Option 2: Chemin explicite (si vous préférez ou n'utilisez pas forFeature partout)
          // Assurez-vous que le chemin correspond à l'emplacement de vos fichiers .entity.ts/.entity.js après compilation (dist)
          // entities: [__dirname + '/../**/*.entity{.ts,.js}'],

          // Synchronisation (IMPORTANT : A METTRE A FALSE EN PROD ET QUAND ON UTILISE LES MIGRATIONS)
          // Ne pas utiliser synchronize=true en production ou avec les migrations.
          // Nous le mettons à false car nous utiliserons les migrations (TICKET-8).
          synchronize: false,

          // Logging SQL (utile en développement)
          logging: isDevelopment, // Affiche les requêtes SQL dans la console si en mode dev

          // Configuration des migrations (utile pour la CLI plus tard)
          migrationsTableName: 'typeorm_migrations', // Nom de la table pour stocker l'historique des migrations
          migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // Chemin vers les fichiers de migration

          // Ne pas exécuter les migrations automatiquement au démarrage
          migrationsRun: false,

          // Autres options PostgreSQL si nécessaire (ex: SSL)
          // ssl: isProduction ? { rejectUnauthorized: false } : false, // Exemple pour SSL en prod
        };
      },
      // Injecter ConfigService dans la factory
      inject: [ConfigService],
    }),

    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
