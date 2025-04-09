# ZC SaaS Boilerplate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Ajoutez d'autres badges ici si nécessaire (Build Status, Coverage, etc.) -->
<!-- [![Build Status](https://github.com/zohac/zc-saas-boilerplate/actions/workflows/...)](...) -->
<!-- [![Coverage Status](https://coveralls.io/repos/github/zohac/zc-saas-boilerplate/badge.svg?branch=main)](...) -->

Un boilerplate robuste et bien structuré construit avec **NestJS** pour démarrer rapidement le développement
d'applications SaaS (Software as a Service). Ce projet met l'accent sur la **Clean Architecture**, la **testabilité**,
et inclut des fonctionnalités communes prêtes à l'emploi ou facilement extensibles via un environnement **Dockerisé**.

## ✨ Fonctionnalités Principales

* **Fondation NestJS :** Utilise le framework Node.js moderne et puissant NestJS.
* **TypeScript :** Typage statique pour une meilleure maintenabilité et productivité.
* **Clean Architecture :** Structure de projet organisée (Domain, Application, Infrastructure, Presentation) pour une
  séparation claire des préoccupations.
* **Gestion de la Configuration :** Intégration de `@nestjs/config` avec support des fichiers `.env` (via `.env.dist`
  comme template) et validation optionnelle.
* **Base de Données (TypeORM & PostgreSQL) :** Intégration de TypeORM avec PostgreSQL, configuration pour la CLI et les
  migrations prête à l'emploi.
* **Authentification (Auth) :** (Prévu) Module d'authentification complet avec stratégies `local` (email/mot de passe)
  et `JWT`.
* **Gestion Utilisateur (User) :** (Prévu) Module de base pour la gestion des utilisateurs (CRUD).
* **Validation des Données :** (Prévu) Utilisation de `class-validator` et `class-transformer` avec un `ValidationPipe`
  global.
* **Gestion Globale des Erreurs :** (Prévu) Filtre d'exception HTTP personnalisé pour des réponses d'erreur cohérentes.
* **Sécurité de Base :** (Prévu) Configuration de `Helmet`, `CORS`, et `Throttler`.
* **Documentation API (Swagger) :** (Prévu) Intégration de `@nestjs/swagger` pour une documentation API auto-générée.
* **Outillage (Linting & Formatting) :** Configuration d'ESLint et Prettier pour un code propre et cohérent.
* **Dockerisation :** `Dockerfile` multi-étapes (Dev/Prod) et `docker-compose.yml`/`docker-compose.override.yml` pour un
  environnement de développement complet et cohérent (App + DB PostgreSQL).
* **Tests :** (Prévu) Structure de base pour les tests unitaires et E2E avec Jest.
* **(Prévu) Concepts SaaS :** Structure prête à accueillir des modules pour les Organisations, Membres, Abonnements,
  Invitations, etc.

## 🚀 Technologie

* **Framework :** [NestJS](https://nestjs.com/) (^10.0.0)
* **Langage :** [TypeScript](https://www.typescriptlang.org/) (^5.1.3)
* **Gestionnaire de Paquets :** [pnpm](https://pnpm.io/fr/)
* **ORM :** [TypeORM](https://typeorm.io/)
* **Base de Données :** [PostgreSQL](https://www.postgresql.org/) (Image Docker `postgres:15-alpine`)
* **Authentification :** (Prévu) [PassportJS](http://www.passportjs.org/), `@nestjs/jwt`, `bcrypt`
* **Validation :** (Prévu) `class-validator`, `class-transformer`
* **Configuration :** `@nestjs/config`
* **Tests :** (Prévu) [Jest](https://jestjs.io/)
* **API Docs :** (Prévu) `@nestjs/swagger`
* **Conteneurisation :** [Docker](https://www.docker.com/), Docker Compose
* **Linting/Formatting :** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 🏛️ Architecture

Ce projet suit les principes de la **Clean Architecture** pour séparer les différentes couches logiques de
l'application :

1. **Domain :** Contient la logique métier principale, les entités de domaine et les interfaces des dépôts. N'a aucune
   dépendance externe.
2. **Application :** Orchestre les cas d'utilisation (Use Cases), contient les DTOs, les interfaces de services
   externes (ports). Dépend du Domain.
3. **Infrastructure :** Implémente les détails techniques : accès BDD (Repositories TypeORM), services externes (JWT,
   Email), ORM (Entités TypeORM). Dépend de l'Application et du Domain. *Contient `data-source.ts` pour la config CLI
   TypeORM.*
4. **Presentation :** Point d'entrée (API REST) : Contrôleurs, Guards, Pipes. Dépend de l'Application.

*Voir `src/` pour la structure des dossiers. Un diagramme peut être ajouté ici.*
<!-- [Lien vers un diagramme d'architecture si disponible] -->

## 🏁 Démarrage Rapide (via Docker - Recommandé)

L'environnement de développement principal est géré par Docker Compose.

### Prérequis

* [Node.js](https://nodejs.org/) (Version LTS v20.12.0 ou supérieure - principalement pour `pnpm`)
* [pnpm](https://pnpm.io/fr/installation)
* [Git](https://git-scm.com/)
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Cloner (ou Forker) le dépôt :**
   ```bash
   git clone https://github.com/zohac/zc-saas-boilerplate.git
   cd zc-saas-boilerplate
   ```
   *(Voir la section "Utiliser ce Boilerplate" pour l'approche avec Fork + Upstream)*

2. **Installer les dépendances (pour l'outillage local comme ESLint/Prettier) :**
   *Bien que l'application tourne dans Docker, `pnpm install` localement est utile pour les outils de dev.*
    ```bash
    pnpm install
    ```

### Configuration

1. **Créer le fichier d'environnement :**
   Copiez le fichier d'exemple `.env.dist` vers `.env`. Ce fichier est ignoré par Git.
   ```bash
   cp .env.dist .env
   ```

2. **Configurer les variables d'environnement :**
   Ouvrez le fichier `.env` et modifiez les valeurs. **Important pour Docker :**
    * `DB_HOST=db` (ou le nom du service DB dans `docker-compose.yml`)
    * Renseignez `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` (ces valeurs seront utilisées pour créer la base de données
      dans le conteneur Docker).
    * Configurez `JWT_SECRET` avec une clé forte.
    * Ajustez `PORT` si nécessaire (ex: `PORT=3001` si 3000 est déjà pris).

   ```dotenv
   # .env (Exemple après copie et modification)
   NODE_ENV=development
   PORT=3000

   DB_HOST=db
   DB_PORT=5432
   DB_USERNAME=saas_user
   DB_PASSWORD=super_secret_password
   DB_DATABASE=saas_db

   JWT_SECRET=generate_a_very_strong_secret_here
   JWT_EXPIRATION_TIME=3600s
   ```

### Lancement et Opérations Courantes (via Docker Compose)

1. **Lancer les services (Application + Base de données) :**
   *Depuis la racine du projet.*
   ```bash
   docker compose up --build -d
   ```
    * `--build` : Reconstruit les images si le `Dockerfile` ou le contexte a changé (obligatoire la première fois ou
      après ajout/màj de dépendances).
    * `-d` : Lance les conteneurs en arrière-plan (detached mode).
      *Pour voir les logs : `docker compose logs -f api` (remplacez `api` par le nom du service si différent).*

2. **Exécuter les migrations de base de données :**
   *(Nécessaire la première fois et après chaque nouvelle migration générée).*
    ```bash
    docker compose exec api pnpm run migration:run
    ```

3. **Accéder à l'application :**
   L'application est maintenant disponible sur `http://localhost:PORT` (ex: `http://localhost:3000` si `PORT=3000`). La
   route `/` renverra 404 (normal), testez les routes spécifiques de vos modules (ex: `/users`, `/auth`, `/api` pour
   Swagger).

4. **Arrêter les services :**
    ```bash
    docker compose down
    ```
   *Pour supprimer aussi les volumes (données de la BDD), ajoutez `-v` : `docker compose down -v`.*

### Gestion des Dépendances (avec Docker)

1. **Ajouter une dépendance :**
    ```bash
    # 1. Ajouter sur l'hôte (met à jour package.json/pnpm-lock.yaml)
    pnpm add nom-du-paquet
    # 2. Reconstruire l'image et relancer
    docker compose up --build -d --force-recreate api
    ```

2. **Mettre à jour les dépendances :**
    ```bash
    # 1. Mettre à jour sur l'hôte
    pnpm up # Ou pnpm up -i (interactif) / pnpm up -L (vers latest, attention)
    # 2. Reconstruire l'image et relancer
    docker compose up --build -d --force-recreate api
    ```

### Migrations de Base de Données (Commandes Docker)

*Toutes ces commandes s'exécutent via `docker compose exec` pour agir à l'intérieur du conteneur `api`.*

* **Générer une nouvelle migration :**
  *(Après avoir modifié des entités TypeORM)*
    ```bash
    # Remplacez 'NomDeLaMigration' par un nom descriptif (ex: CreateUserTable)
    docker compose exec api pnpm run migration:generate --name=NomDeLaMigration
    ```
  *Le fichier sera créé dans `src/database/migrations` sur votre machine hôte (via le volume monté).*

* **Exécuter les migrations en attente :**
  ```bash
  docker compose exec api pnpm run migration:run
  ```

* **Annuler la dernière migration exécutée :**
  ```bash
  docker compose exec api pnpm run migration:revert
  ```

* **Voir le statut des migrations :**
  ```bash
  docker compose exec api pnpm run migration:show
  ```

### Tests (Commandes Docker)

* **Exécuter tous les tests unitaires :**
  ```bash
  docker compose exec api pnpm run test
  ```

* **Exécuter tous les tests End-to-End (E2E) :**
  *(Nécessite que les conteneurs `api` et `db` soient démarrés).*
  ```bash
  docker compose exec api pnpm run test:e2e
  ```

* **Exécuter les tests unitaires avec couverture :**
    ```bash
    docker compose exec api pnpm run test:cov
    ```

### Linting et Formatage (Commandes locales)

Ces commandes peuvent être exécutées localement car elles agissent sur les fichiers sources sur votre machine hôte (
assurez-vous d'avoir fait `pnpm install` localement).

* **Vérifier les erreurs de linting :**
  ```bash
  pnpm run lint
  ```

* **Formater le code avec Prettier :**
  ```bash
  pnpm run format
  ```

### Documentation API (Swagger)

*(Sera disponible une fois le TICKET-26 implémenté)*
Une fois l'application lancée, la documentation Swagger UI sera typiquement disponible à l'adresse :
`http://localhost:PORT/api` (ex: `http://localhost:3000/api`)

## 🏗️ Structure du Projet (Aperçu)

```bash
zc-saas-boilerplate/
├── dist/ # Code compilé (utilisé en prod et pour l'exécution)
├── node_modules/ # Dépendances (gérées par pnpm)
├── src/ # Code source de l'application
│   ├── app.module.ts # Module racine
│   ├── main.ts # Point d'entrée de l'application
│   ├── infrastructure/ # Couche Infrastructure
│   │   ├── database/ # Code lié à la BDD (Repositories, Entities ORM, data-source.ts)
│   │   ├── migrations/ # Contient les migrations générées
│   │   └── ... # Autres services infra (JWT, Mailer...)
│   ├── shared/ # Code partagé (common, core, décorateurs...)
│   ├── auth/ # (Prévu) Module d'Authentification (structure Clean Arch)
│   ├── user/ # (Prévu) Module Utilisateur (structure Clean Arch)
│   └── ... # Autres modules métier
├── test/ # Tests E2E
├── .env.example # Fichier d'exemple pour les variables d'environnement
├── .dockerignore
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── docker-compose.override.yml # Surcharges Docker Compose pour le développement
├── docker-compose.yml # Configuration Docker Compose de base/production
├── Dockerfile # Instructions pour construire l'image Docker
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml # Lockfile pnpm
├── README.md # Vous êtes ici !
├── tsconfig.build.json
└── tsconfig.json
```

## 🔑 Modules Clés (Implémentés / Prévus)

* **AppModule :** Module racine.
* **ConfigModule :** Chargement et accès à la configuration `.env`.
* **TypeOrmModule :** Connexion BDD et gestion des entités.
* **(Prévu) UserModule :** Gestion des utilisateurs.
* **(Prévu) AuthModule :** Authentification et autorisation.
* **(Prévu) OrganizationModule :** Gestion des comptes clients/tenants.
* **(Prévu) MembershipModule :** Gestion des membres d'organisations.
* **(Prévu) Billing/SubscriptionModule :** Gestion des abonnements/paiements.

## 💡 Utiliser ce Boilerplate pour Votre Projet

L'approche recommandée est d'utiliser ce dépôt comme point de départ en le **forkant**.

1. **Forkez** `https://github.com/zohac/zc-saas-boilerplate.git` sur GitHub.
2. **Clonez votre fork** localement :
    ```bash
    git clone https://github.com/VOTRE_USERNAME/zc-saas-boilerplate.git mon-nouveau-projet
    cd mon-nouveau-projet
    ```
3. **(Recommandé) Configurez l'original comme "upstream" :**
    ```bash
    git remote add upstream https://github.com/zohac/zc-saas-boilerplate.git
    ```
4. **Développez** votre application.
5. **Récupérer les mises à jour du boilerplate (occasionnellement) :**
    ```bash
    git fetch upstream
    git merge upstream/main # Ou rebase, résolvez les conflits
    ```

## 🙌 Contribution

Les contributions pour améliorer ce boilerplate sont les bienvenues !

1. Forkez le dépôt original (`zohac/zc-saas-boilerplate`).
2. Créez une branche (`git checkout -b feature/nom-feature`).
3. Commitez vos changements (`git commit -am 'feat: Mon amélioration'`).
4. Poussez vers votre fork (`git push origin feature/nom-feature`).
5. Ouvrez une Pull Request vers la branche `main` du dépôt original.

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` (à ajouter si absent) pour plus de détails.
