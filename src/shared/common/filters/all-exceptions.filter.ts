// src/shared/common/filters/all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express'; // Importer les types Express
import { QueryFailedError } from 'typeorm';

// Interface pour la structure de la réponse d'erreur
interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errorDetails?: unknown; // Garder les détails optionnels pour les erreurs de validation etc.
}

// Interface pour typer les erreurs PostgreSQL (simplifié)
interface PostgresError extends Error {
  code?: string;
  detail?: string;
  // Ajoutez d'autres champs si nécessaire (schema, table, constraint...)
}

@Catch() // Capture toutes les exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  // Logger NestJS pour ce filtre
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // Injecter HttpAdapterHost pour pouvoir répondre indépendamment de la plateforme (Express/Fastify)
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost; // Obtenir l'adapter HTTP actuel
    const ctx = host.switchToHttp(); // Obtenir le contexte HTTP
    const request = ctx.getRequest<Request>(); // Obtenir l'objet Request (typé Express)
    const response = ctx.getResponse<Response>(); // Obtenir l'objet Response (typé Express)

    // Valeurs par défaut pour le statut et le message
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal error occurred.';

    let logDetails: unknown = exception; // Variable pour stocker les détails spécifiques à loguer
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let responseDetails: unknown | undefined = undefined; // Variable pour les détails à inclure dans la réponse JSON

    // --- Gestion des HttpException ---
    if (exception instanceof HttpException) {
      status = exception.getStatus(); // Obtenir le statut HTTP de l'exception
      const errorResponse = exception.getResponse(); // Obtenir la réponse de l'exception (string ou object)
      logDetails = errorResponse; // Loguer la réponse brute de l'exception

      // Essayer d'extraire un message significatif
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        'message' in errorResponse // Vérifier si l'objet a une propriété 'message'
      ) {
        const msg = (errorResponse as { message: unknown }).message;
        // Utiliser le message de l'objet s'il est string, sinon fallback au message de l'exception parente
        message = typeof msg === 'string' ? msg : exception.message;
        // Si la réponse est un objet, on l'inclut dans les détails de la réponse client (utile pour les erreurs de validation)
        responseDetails = errorResponse;
      } else {
        message = exception.message; // Fallback final
      }

      // Logguer comme un avertissement car c'est une erreur HTTP "attendue"
      this.logger.warn(
        `[${AllExceptionsFilter.name}] HTTP Exception [${status}] on ${request.method} ${request.url}: ${message}`,
        JSON.stringify(logDetails),
      );

      // --- Gestion des QueryFailedError (Erreurs TypeORM/BDD) ---
    } else if (exception instanceof QueryFailedError) {
      // Tenter de caster l'erreur driver en PostgresError pour accéder aux codes spécifiques
      const pgError = exception.driverError as PostgresError;
      const driverErrorCode = pgError?.code; // Code erreur PG (ex: '23505')
      const driverErrorDetail = pgError?.detail; // Détail PG (ex: Key (...) already exists)

      // Préparer les détails pour le log serveur (plus d'infos que pour le client)
      logDetails = {
        code: driverErrorCode,
        detail: driverErrorDetail,
        query: exception.query,
        parameters: exception.parameters, // Attention: peuvent contenir des données sensibles
      };

      // Mapper les codes PG courants vers des statuts/messages HTTP
      switch (driverErrorCode) {
        case '23505': // Unique constraint violation
          status = HttpStatus.CONFLICT; // 409
          message = 'Resource already exists or conflicts with existing data.';
          // On pourrait ajouter le détail PG au message client, mais prudence en production
          // message += driverErrorDetail ? ` Detail: ${driverErrorDetail}` : '';
          break;
        case '23503': // Foreign key violation
          status = HttpStatus.BAD_REQUEST; // 400
          message = 'Invalid reference to another resource.';
          break;
        // case '22P02': // Invalid text representation (ex: mauvais format UUID)
        //   status = HttpStatus.BAD_REQUEST;
        //   message = 'Invalid input data format.';
        //   break;
        // Ajouter d'autres mappings si nécessaire
        default:
          // Pour toutes les autres erreurs BDD non mappées, on reste sur 500
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'A database error occurred.'; // Message plus spécifique que l'erreur interne générale
          break;
      }

      // Logguer comme une erreur serveur grave
      this.logger.error(
        `[${AllExceptionsFilter.name}] Database Query Failed [${status}] on ${request.method} ${request.url}: Code=${driverErrorCode ?? 'N/A'}, Message=${exception.message}`,
        logDetails, // Loguer les détails techniques (code, detail, query...)
        exception.stack, // Inclure la stack trace de l'erreur TypeORM
      );

      // --- Gestion des autres erreurs JS (instanceof Error) ---
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected internal server error occurred.';
      logDetails = { name: exception.name, message: exception.message }; // Détails pour le log

      // Logguer l'erreur interne
      this.logger.error(
        `[${AllExceptionsFilter.name}] Unhandled Error [${status}] on ${request.method} ${request.url}: ${exception.message}`,
        logDetails,
        exception.stack, // Stack trace de l'erreur JS
      );

      // --- Gérer les cas où ce qui est 'throw' n'est même pas une Error ---
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unknown internal error occurred.';
      logDetails = exception; // Logguer la valeur brute qui a été 'throw'

      // Logguer cette erreur très inhabituelle
      this.logger.error(
        `[${AllExceptionsFilter.name}] Unknown Unhandled Exception [${status}] on ${request.method} ${request.url}:`,
        logDetails, // Logguer la valeur brute
      );
    }

    // --- Construire et envoyer la réponse HTTP ---
    const responseBody: ErrorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url, // Utiliser request.url (typé)
      method: request.method, // Utiliser request.method (typé)
      message: message,
      // Inclure conditionnellement les détails (utile pour erreurs de validation HttpException)
      ...(responseDetails !== undefined && { errorDetails: responseDetails }),
    };

    // Utiliser l'adapter pour envoyer la réponse (ignorer l'avertissement d'assignation non sûre ici)
    httpAdapter.reply(response, responseBody, status);
  }
}
