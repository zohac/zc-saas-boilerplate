import { AuthModule } from "@auth/auth.module";
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from "@user/user.module";

@Module({
  imports: [
    // Charger ConfigModule globalement
    ConfigModule.forRoot({
      isGlobal: true, // Rend ConfigService disponible partout
      envFilePath: '.env', // Spécifie le fichier .env à charger (par défaut, mais explicite c'est bien)
      // ignoreEnvFile: false, // Mettre à true si vous voulez UNIQUEMENT utiliser les variables système
      // cache: true, // Active la mise en cache des variables pour de meilleures perfs
    }),

    // Configurer ThrottlerModule
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 1. Lire les valeurs (qui peuvent être string ou undefined)
        const ttlFromEnv = configService.get('THROTTLE_TTL'); // Lire sans forcer le type <number>
        const limitFromEnv = configService.get('THROTTLE_LIMIT');

        // 2. Convertir en nombre, avec des valeurs par défaut numériques claires
        // Utiliser parseInt avec une base de 10. Si NaN, utiliser le défaut.
        const ttl = parseInt(ttlFromEnv ?? '60000', 10); // Défaut 60000 ms (60s)
        const limit = parseInt(limitFromEnv ?? '10', 10); // Défaut 10

        // Ajouter une vérification pour s'assurer qu'on a bien des nombres valides
        const finalTtl = !isNaN(ttl) && ttl > 0 ? ttl : 60000; // Reprendre le défaut si la conversion échoue
        const finalLimit = !isNaN(limit) && limit > 0 ? limit : 10; // Reprendre le défaut si la conversion échoue

        console.log(`Throttler Config: TTL=${finalTtl}ms, Limit=${finalLimit} reqs (Read from env: ttl='${ttlFromEnv}', limit='${limitFromEnv}')`);

        return [{ // Retourner la config dans un tableau
          ttl: finalTtl,
          limit: finalLimit,
        }];
      },
    }),
    // ThrottlerModule.forRoot({
    //   throttlers: [{ ttl: 60000, limit: 2 }],
    // }),

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
    AuthModule,
  ],
  controllers: [],
  providers: [
    // --- Appliquer ThrottlerGuard globalement via le système DI ---
    // C'est la manière recommandée par NestJS plutôt que app.useGlobalGuards() dans main.ts
    // pour permettre l'injection de dépendances dans les guards si nécessaire à l'avenir.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
