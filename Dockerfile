# ======== Base Stage (Common dependencies) ========
FROM node:22.12.0 AS base
# Utiliser Node.js 20 (LTS actuel au moment de la rédaction)
# Alpine est plus petit, mais peut manquer de certaines dépendances.
# Utiliser node:20-alpine si vous priorisez la taille d'image.

# Installer pnpm
RUN npm install -g pnpm

# Créer le répertoire de l'application
WORKDIR /usr/src/app


# ======== Builder Stage (Install all deps, build code) ========
FROM base AS builder

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer TOUTES les dépendances (incluant devDependencies pour le build)
# --frozen-lockfile assure l'utilisation exacte des versions du lockfile
RUN pnpm install --frozen-lockfile

# Copier tout le code source
COPY . .

# Générer le build de production
RUN pnpm run build
# Optionnel: Supprimer les devDependencies après le build pour alléger l'étape suivante si on copie node_modules
# RUN pnpm prune --prod


# ======== Development Stage (For local development with hot-reload) ========
FROM base AS development

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer TOUTES les dépendances (dev inclus)
RUN pnpm install --frozen-lockfile

# Copier le reste du code (sera écrasé par le volume mount dans docker-compose.override.yml)
COPY . .

# Le port par défaut exposé par NestJS (peut être changé via .env)
EXPOSE 3000

# Commande par défaut pour le développement (sera utilisée par docker-compose.override.yml)
CMD ["pnpm", "run", "start:dev"]


# ======== Production Stage (Optimized for deployment) ========
FROM base AS production

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer UNIQUEMENT les dépendances de production
RUN pnpm install --prod --frozen-lockfile

# Copier le build depuis l'étape 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Ajouter un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Changer le propriétaire des fichiers
# USER nestjs # Décommenter si vous copiez node_modules directement, sinon les permissions posent problème

# Le port par défaut exposé par NestJS
EXPOSE 3000

# Définir l'utilisateur pour exécuter l'application
USER nestjs

# Commande pour lancer l'application en production
CMD ["node", "dist/main"]