// src/shared/common/filters/all-exceptions.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm'; // Importer l'erreur spécifique

@Catch() // Capture TOUTES les exceptions non interceptées par des filtres plus spécifiques
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name); // Initialiser un logger

  // Injecter HttpAdapterHost pour interagir avec la plateforme HTTP sous-jacente
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const {httpAdapter} = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let responseBody: Record<string, any>; // Structure de la réponse

    // Log de l'exception brute pour le débogage
    this.logger.error(`Caught exception:`, exception);
    if (exception instanceof Error) {
      this.logger.error(`Stack trace: ${exception.stack}`);
    }


    // --- Gérer les HttpException (erreurs HTTP standard de NestJS) ---
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any)?.message || exception.message; // Tente de prendre le message structuré

      // Utiliser la structure de réponse standard pour HttpException
      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
        method: httpAdapter.getRequestMethod(request),
        message: message,
        // On peut ajouter l'erreur originale si c'est un objet (utile pour les erreurs de validation)
        ...(typeof errorResponse === 'object' && errorResponse !== null && {errorDetails: errorResponse}),
      };

      this.logger.warn(`HTTP Exception [${status}] on ${request.method} ${request.url}: ${message}`);

      // --- Gérer les QueryFailedError (erreurs spécifiques de TypeORM/BDD) ---
    } else if (exception instanceof QueryFailedError) {
      message = 'Database query failed.'; // Message par défaut pour les erreurs BDD
      const driverErrorCode = (exception as any).code; // Code d'erreur spécifique du driver (ex: PostgreSQL)
      const driverErrorDetail = (exception as any).detail; // Détail fourni par la BDD

      // Mapper les codes d'erreur BDD courants vers des statuts HTTP pertinents
      switch (driverErrorCode) {
        case '23505': // Violation de contrainte unique (PostgreSQL)
          status = HttpStatus.CONFLICT; // 409
          message += 'Resource already exists or conflicts with existing data.';
          if (driverErrorDetail) { // Tenter d'extraire le détail (ex: quelle clé)
            message += ` Detail: ${driverErrorDetail}`; // ATTENTION: Ne pas exposer de détails trop techniques en prod
          }
          break;
        case '23503': // Violation de clé étrangère (PostgreSQL)
          status = HttpStatus.BAD_REQUEST; // 400 (souvent une mauvaise référence fournie par le client)
          message = 'Invalid reference to another resource.';
          break;
        // Ajoutez d'autres codes d'erreur pertinents ici (ex: '22P02' pour invalid text representation)
        // case '22P02':
        //    status = HttpStatus.BAD_REQUEST;
        //    message = 'Invalid input data format.';
        //    break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR; // Pour les autres erreurs BDD non mappées
          message = 'An internal database error occurred.';
          break;
      }

      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
        method: httpAdapter.getRequestMethod(request),
        message: message,
        // Ne PAS exposer l'erreur SQL brute en production, mais loggez-la
        // errorDetails: { code: driverErrorCode } // Optionnel pour le dev
      };

      this.logger.error(
        `Database Query Failed [${status}] on ${request.method} ${request.url}: Code=${driverErrorCode}, Message=${exception.message}`,
        exception.stack // Logguer la stack trace de l'erreur BDD
      );

      // --- Gérer toutes les autres erreurs (non-HTTP, non-QueryFailed) ---
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An internal server error occurred.';

      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
        method: httpAdapter.getRequestMethod(request),
        message: message,
      };

      // Logguer l'erreur inconnue
      this.logger.error(
        `Unhandled Exception [${status}] on ${request.method} ${request.url}:`,
        exception,
        (exception instanceof Error) ? exception.stack : '(No stack trace)'
      );
    }

    // Envoyer la réponse HTTP formatée
    httpAdapter.reply(response, responseBody, status);
  }
}
