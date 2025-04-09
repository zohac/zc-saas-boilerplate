// eslint.config.mjs
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImport from 'eslint-plugin-import'; // Pour la gestion des imports
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'; // Pour les imports inutilisés
import globals from 'globals';

export default tseslint.config(
    {
        // Ignore ce fichier de config lui-même et les dossiers générés/node_modules
        ignores: ['eslint.config.mjs', 'node_modules/**', 'dist/**'],
    },

    // Configuration de base ESLint
    eslint.configs.recommended,

    // Configurations TypeScript ESLint recommandées (avec vérification de types)
    ...tseslint.configs.recommendedTypeChecked,
    // Configuration pour le style (moins strict que recommendedTypeChecked)
    ...tseslint.configs.stylisticTypeChecked,

    // --- Configuration spécifique au parseur et au projet ---
    {
        languageOptions: {
            ecmaVersion: 'latest', // Utiliser la dernière version ECMAScript supportée
            sourceType: 'module',
            globals: {
                ...globals.node, // Globaux Node.js (console, process, etc.)
                ...globals.jest, // Globaux Jest (describe, it, expect, etc.)
            },
            parserOptions: {
                project: true, // Active les règles basées sur les types TypeScript
                tsconfigRootDir: import.meta.dirname, // Trouve automatiquement tsconfig.json
            },
        },
        // Appliquer ces règles aux fichiers TS/JS (ajuster si vous avez du JS pur)
        files: ['**/*.ts'],
    },

    // --- Plugin pour les imports ---
    {
        plugins: {
            import: eslintPluginImport,
            'unused-imports': eslintPluginUnusedImports,
        },
        rules: {
            // Règles de base pour les imports
            'import/no-unresolved': 'off', // Géré par TypeScript
            'import/prefer-default-export': 'off', // Préférence personnelle
            'import/no-default-export': 'off', // Autoris
            'import/no-extraneous-dependencies': 'off', // Peut être activé avec config pour monorepos
            'import/extensions': 'off', // Pas besoin avec TS

            // Trier et grouper les imports (améliore la lisibilité)
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin', // Modules Node built-in (fs, path)
                        'external', // Dépendances npm
                        'internal', // Alias de chemins (@/...)
                        'parent', // Imports relatifs remontants (../)
                        'sibling', // Imports relatifs frères (./)
                        'index', // Imports d'index (./index)
                        'object', // Imports de types (`import type {}`)
                        'type', // Imports de types (`import type {}`) séparés
                    ],
                    'newlines-between': 'always', // Ligne vide entre les groupes
                    alphabetize: {order: 'asc', caseInsensitive: true}, // Ordre alphabétique
                },
            ],
            // Nettoyer les imports inutilisés
            '@typescript-eslint/no-unused-vars': 'off', // Désactivé car unused-imports le gère mieux
            'unused-imports/no-unused-imports': 'warn',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all', // Vérifie toutes les variables
                    varsIgnorePattern: '^_', // Ignore les variables commençant par _
                    args: 'after-used', // Vérifie les arguments après leur dernière utilisation
                    argsIgnorePattern: '^_', // Ignore les arguments commençant par _
                },
            ],
        },
        settings: {
            // Configuration pour aider eslint-plugin-import avec TypeScript et les alias
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
                node: true,
            },
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts'],
            },
        },
    },


    // --- Intégration Prettier (DOIT ÊTRE À LA FIN) ---
    // Désactive les règles ESLint qui entrent en conflit avec Prettier
    eslintPluginPrettierRecommended,


    // --- Règles Personnalisées/Overrides (Après Prettier) ---
    {
        rules: {
            // Exemples de règles souvent utiles dans NestJS/Node :

            // Permettre les constructeurs vides (courant avec DI)
            'no-empty-function': 'off',
            '@typescript-eslint/no-empty-function': 'off',

            // Permettre les fonctions async sans await (utile pour les résolveurs/controllers simples)
            '@typescript-eslint/require-await': 'off',

            // Gérer les promesses non attendues (important !)
            '@typescript-eslint/no-floating-promises': ['error', {ignoreVoid: true}], // Exige await ou .catch(), sauf si void est utilisé pour indiquer l'intention

            // Types any (à éviter, mais parfois nécessaire)
            '@typescript-eslint/no-explicit-any': 'warn', // Avertissement au lieu de off

            // Utilisation de types inférés (préférence personnelle)
            '@typescript-eslint/no-inferrable-types': 'off',

            // Inférence depuis l'utilisation (parfois trop strict)
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',

            // Conventions de nommage (optionnel)
            // '@typescript-eslint/naming-convention': [
            //   'warn',
            //    { selector: 'interface', format: ['PascalCase'], prefix: ['I'] }, // Ex: IUserRepository
            //    { selector: 'class', format: ['PascalCase'] },
            // ],

            // Forcer les types de retour explicites (bonne pratique)
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'warn',

        },
    },
);
