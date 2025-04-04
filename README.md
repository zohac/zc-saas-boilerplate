# ZC SaaS Boilerplate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Ajoutez d'autres badges ici si nécessaire (Build Status, Coverage, etc.) -->
<!-- [![Build Status](https://travis-ci.org/your-username/zc-saas-boilerplate.svg?branch=main)](https://travis-ci.org/your-username/zc-saas-boilerplate) -->
<!-- [![Coverage Status](https://coveralls.io/repos/github/your-username/zc-saas-boilerplate/badge.svg?branch=main)](https://coveralls.io/github/your-username/zc-saas-boilerplate?branch=main) -->

Un boilerplate robuste et bien structuré construit avec **NestJS** pour démarrer rapidement le développement d'applications SaaS (Software as a Service). Ce projet met l'accent sur la **Clean Architecture**, la **testabilité**, et inclut des fonctionnalités communes prêtes à l'emploi ou facilement extensibles.

## ✨ Fonctionnalités Principales

*   **Fondation NestJS :** Utilise le framework Node.js moderne et puissant NestJS.
*   **TypeScript :** Typage statique pour une meilleure maintenabilité et productivité.
*   **Clean Architecture :** Structure de projet organisée (Domain, Application, Infrastructure, Presentation) pour une séparation claire des préoccupations.
*   **Gestion de la Configuration :** Intégration de `@nestjs/config` avec support des fichiers `.env` et validation optionnelle.
*   **Base de Données (TypeORM & PostgreSQL) :** Intégration de TypeORM avec PostgreSQL, configuration prête pour les migrations.
*   **Authentification (Auth) :** Module d'authentification complet avec stratégies `local` (email/mot de passe) et `JWT` (JSON Web Tokens). Inclut le hachage de mot de passe (`bcrypt`).
*   **Gestion Utilisateur (User) :** Module de base pour la gestion des utilisateurs (CRUD).
*   **Validation des Données :** Utilisation de `class-validator` et `class-transformer` avec un `ValidationPipe` global.
*   **Gestion Globale des Erreurs :** Filtre d'exception HTTP personnalisé pour des réponses d'erreur cohérentes.
*   **Sécurité de Base :** Configuration de `Helmet`, `CORS`, et `Throttler` (Rate Limiting).
*   **Documentation API (Swagger) :** Intégration de `@nestjs/swagger` pour une documentation API auto-générée et interactive.
*   **Outillage (Linting & Formatting) :** Configuration d'ESLint et Prettier pour un code propre et cohérent.
*   **Dockerisation :** `Dockerfile` et `docker-compose.yml` pour un développement et un déploiement facilités (App + DB PostgreSQL).
*   **Tests :** Structure de base pour les tests unitaires et E2E avec Jest.
*   **(Prévu) Concepts SaaS :** Structure prête à accueillir des modules pour les Organisations, Membres, Abonnements, Invitations, etc.

## 🚀 Technologie

*   **Framework :** [NestJS](https://nestjs.com/) (^Version utilisée, e.g., ^10.0.0)
*   **Langage :** [TypeScript](https://www.typescriptlang.org/) (^Version utilisée, e.g., ^5.0.0)
*   **ORM :** [TypeORM](https://typeorm.io/)
*   **Base de Données :** [PostgreSQL](https://www.postgresql.org/)
*   **Authentification :** [PassportJS](http://www.passportjs.org/) (`passport-local`, `passport-jwt`), `@nestjs/jwt`
*   **Validation :** `class-validator`, `class-transformer`
*   **Configuration :** `@nestjs/config`
*   **Tests :** [Jest](https://jestjs.io/)
*   **API Docs :** `@nestjs/swagger`
*   **Conteneurisation :** [Docker](https://www.docker.com/), Docker Compose
*   **Linting/Formatting :** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 🏛️ Architecture

Ce projet suit les principes de la **Clean Architecture** pour séparer les différentes couches logiques de l'application :

1.  **Domain :** Contient la logique métier principale, les entités de domaine (interfaces ou classes simples) et les interfaces des dépôts (repositories). N'a aucune dépendance externe.
2.  **Application :** Orchestre les cas d'utilisation (Use Cases) de l'application. Contient les DTOs (Data Transfer Objects), les interfaces de services externes (ports), et dépend du Domain.
3.  **Infrastructure :** Implémente les détails techniques comme l'accès à la base de données (implémentation des repositories via TypeORM), les services externes (JWT, Email, etc.), l'ORM (Entités TypeORM). Dépend de l'Application (implémente ses interfaces) et du Domain.
4.  **Presentation :** Point d'entrée de l'application (ex: API REST). Contient les Contrôleurs, les Guards, les Pipes, etc. Dépend de l'Application (utilise les Use Cases).

*Voir `src/` pour la structure des dossiers implémentant cette architecture.*
<!-- [Lien vers un diagramme d'architecture si disponible] -->

## 🏁 Démarrage Rapide

### Prérequis

*   [Node.js](https://nodejs.org/) (Version LTS recommandée, v20.12.0)
*   [pnpm](https://pnpm.io/fr/)
*   [Git](https://git-scm.com/)
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (pour l'environnement de développement basé sur Docker)
*   Une instance PostgreSQL (si vous ne lancez pas via Docker)

### Installation

1.  **Cloner (ou Forker) le dépôt :**
    ```bash
    git clone https://github.com/votre-username/zc-saas-boilerplate.git
    cd zc-saas-boilerplate
    ```
    *(Voir la section "Utiliser ce Boilerplate" pour l'approche recommandée avec Fork + Upstream)*

2.  **Installer les dépendances :**
    ```bash
    pnpm install
    ```

### Configuration

1.  **Créer le fichier d'environnement :**
    Copiez le fichier d'exemple `.env.dist` vers `.env`. Ce fichier est ignoré par Git.
    ```bash
    cp .env.dist .env
    ```

2.  **Configurer les variables d'environnement :**
    Ouvrez le fichier `.env` et modifiez les valeurs selon votre environnement local, notamment pour la base de données et les secrets JWT.

    ```dotenv
    # Application
    NODE_ENV=development
    PORT=3000

    # Database (PostgreSQL)
    DB_HOST=localhost # ou le nom du service docker si vous utilisez docker-compose (e.g., postgres_db)
    DB_PORT=5432
    DB_USERNAME=votre_user_pg
    DB_PASSWORD=votre_mot_de_passe_pg
    DB_DATABASE=votre_nom_db_pg

    # JWT
    JWT_SECRET=VOTRE_SECRET_JWT_TRES_FORT # Changez ceci !
    JWT_EXPIRATION_TIME=3600s # Ex: 1 heure

    # Autres configurations (Mailer, Redis, etc. à ajouter si nécessaire)
    # ...
    ```

### Lancement de l'Application

#### Option 1 : Localement (Nécessite une base de données PostgreSQL en cours d'exécution séparément)

1.  **Assurez-vous que votre instance PostgreSQL est lancée et accessible** avec les informations fournies dans `.env`.

2.  **Exécuter les migrations (première fois ou après des changements de modèle) :**
    ```bash
    pnpm run migration:run
    ```

3.  **Démarrer le serveur de développement :**
    ```bash
    pnpm run start:dev
    ```
    L'application sera disponible sur `http://localhost:PORT` (par défaut `http://localhost:3000`).

#### Option 2 : Avec Docker Compose (Recommandé pour un environnement de développement cohérent)

1.  **Assurez-vous que Docker est en cours d'exécution.**

2.  **Mettez à jour `DB_HOST` dans `.env` :**
    Changez `DB_HOST=localhost` par `DB_HOST=postgres_db` (ou le nom que vous avez donné au service de base de données dans `docker-compose.yml`).

3.  **Lancer les services (Application + Base de données) :**
    ```bash
    docker-compose up --build
    ```
    *(Le `--build` n'est nécessaire que la première fois ou si vous modifiez le Dockerfile ou les dépendances).*

4.  **Dans un autre terminal (pendant que `docker-compose up` est en cours d'exécution), exécutez les migrations DANS le conteneur :**
    ```bash
    docker-compose exec api npm run migration:run
    ```
    *(Remplacez `api` par le nom du service de votre application dans `docker-compose.yml` si différent)*.

    L'application sera disponible sur `http://localhost:PORT` (par défaut `http://localhost:3000`) et connectée à la base de données Dockerisée.

### Migrations de Base de Données (TypeORM)

*   **Générer une nouvelle migration après des changements dans les entités :**
    ```bash
    # Remplacez 'NomDeLaMigration' par un nom descriptif (ex: CreateUserTable)
    pnpm run migration:generate --name=NomDeLaMigration
    ```
    Vérifiez le fichier de migration généré dans `src/database/migrations`.

*   **Exécuter les migrations en attente :**
    ```bash
    pnpm run migration:run
    ```

*   **Annuler la dernière migration exécutée :**
    ```bash
    pnpm run migration:revert
    ```

### Tests

*   **Exécuter tous les tests unitaires :**
    ```bash
    pnpm run test
    ```

*   **Exécuter tous les tests End-to-End (E2E) :**
    *(Nécessite une base de données configurée et potentiellement en cours d'exécution)*
    ```bash
    pnpm run test:e2e
    ```

*   **Exécuter tous les tests avec couverture :**
    ```bash
    pnpm run test:cov
    ```

### Linting et Formatage

*   **Vérifier les erreurs de linting :**
    ```bash
    pnpm run lint
    ```

*   **Formater le code avec Prettier :**
    ```bash
    pnpm run format
    ```

### Documentation API (Swagger)

Une fois l'application lancée (localement ou via Docker), la documentation Swagger UI est généralement disponible à l'adresse :

`http://localhost:PORT/api` (par défaut `http://localhost:3000/api`)

Cette interface vous permet d'explorer et d'interagir avec les endpoints de l'API.

## 🏗️ Structure du Projet (Aperçu)
```bash
zc-saas-boilerplate/
├── dist/ # Code compilé (utilisé en production)
├── node_modules/ # Dépendances
├── src/ # Code source de l'application
│   ├── app.module.ts # Module racine
│   ├── main.ts # Point d'entrée de l'application
│   ├── config/ # Configuration de l'application (env validation, etc.)
│   ├── database/ # Configuration BDD, migrations, seeds (optionnel)
│   ├── shared/ # Code partagé (communs, filtres, pipes, décorateurs...)
│   │   ├── common/
│   │   └── core/
│   ├── auth/ # Module d'Authentification
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/ (controllers, guards)
│   ├── user/ # Module Utilisateur
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/ (controllers)
│   ├── organization/ # (Futur) Module Organisation/Tenant
│   │   └── ...
│   └── ... # Autres modules métier
├── test/ # Tests E2E
├── .env.example # Fichier d'exemple pour les variables d'environnement
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
├── README.md # Vous êtes ici !
└── tsconfig.json
└── tsconfig.build.json
```

## 🔑 Modules Clés (Implémentés / Prévus)

*   **AppModule :** Module racine, assemble l'application.
*   **ConfigModule :** Chargement et validation de la configuration.
*   **DatabaseModule (via TypeOrmModule) :** Connexion et gestion de la base de données.
*   **UserModule :** Gestion des entités Utilisateur.
*   **AuthModule :** Authentification (login, protection des routes via JWT).
*   **(Prévu) OrganizationModule / TenantModule :** Gestion des comptes clients / locataires.
*   **(Prévu) MembershipModule :** Liaison Utilisateurs <-> Organisations avec rôles.
*   **(Prévu) BillingModule / SubscriptionModule :** Gestion des plans et abonnements.

## 💡 Utiliser ce Boilerplate pour Votre Projet

L'approche recommandée est d'utiliser ce dépôt comme point de départ en le **forkant**. Cela vous permet de bénéficier des mises à jour futures du boilerplate tout en développant votre propre application.

1.  **Forkez** ce dépôt sur GitHub.
2.  **Clonez votre fork** sur votre machine locale :
    ```bash
    git clone https://github.com/zohac/zc-saas-boilerplate.git mon-nouveau-projet
    cd mon-nouveau-projet
    ```
3.  **(Optionnel mais Recommandé) Configurez le dépôt original comme "upstream" :**
    ```bash
    git remote add upstream https://github.com/zohac/zc-saas-boilerplate.git
    ```
    
4.  **Développez votre application** sur votre fork.

5.  **Pour récupérer les mises à jour du boilerplate (si nécessaire) :**
    ```bash
    # Récupérer les changements de l'upstream
    git fetch upstream

    # Fusionner les changements de la branche principale de l'upstream dans votre branche actuelle
    # (Résolvez les conflits si nécessaire)
    git merge upstream/main
    # OU utiliser rebase (attention si vous avez déjà pushé vos changements)
    # git rebase upstream/main
    ```

## 🙌 Contribution

Les contributions sont les bienvenues ! Si vous souhaitez améliorer ce boilerplate :

1.  Forkez le dépôt.
2.  Créez une nouvelle branche (`git checkout -b feature/ma-nouvelle-feature`).
3.  Commitez vos changements (`git commit -am 'feat: Ajout de ma feature'`).
4.  Poussez vers la branche (`git push origin feature/ma-nouvelle-feature`).
5.  Ouvrez une Pull Request.

Veuillez suivre les conventions de code et ajouter des tests si pertinent.

<!-- [Lien vers des directives de contribution plus détaillées si nécessaire] -->

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
