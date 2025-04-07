// src/shared/infrastructure/database/data-source.ts

import 'dotenv/config'; // Charge les variables .env directement au chargement du fichier
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

// Configuration de base partagée
const baseOptions: Partial<DataSourceOptions> = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost', // Utilise process.env car hors contexte NestJS
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // Toujours false avec les migrations
  logging: process.env.NODE_ENV === 'development', // Log SQL en dev
  migrationsTableName: 'typeorm_migrations', // Nom de la table des migrations
};

// Configuration pour l'exécution de l'application ET la CLI (pointe vers les fichiers compilés)
export const dataSourceOptions: DataSourceOptions = {
  ...baseOptions,
  // IMPORTANT: Pointe vers les fichiers JS compilés pour les entités et migrations
  entities: [path.join(__dirname, '/../../../**/*.entity{.js,.ts}')], // Accepte ts pour la génération, js pour l'exécution
  migrations: [path.join(__dirname, '/migrations/*{.js,.ts}')], // Accepte ts pour la génération, js pour l'exécution
} as DataSourceOptions; // Cast explicite si nécessaire

// Créer et exporter l'instance DataSource que la CLI utilisera
const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;