import { ArgumentsHost, Catch, ExceptionFilter, HttpException, } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException) // Capture uniquement les exceptions de type HttpException
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse(); // Peut être une chaîne ou un objet

    // Structure de réponse personnalisée
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      // Prend le message de l'exception ou la réponse complète si c'est un objet
      message:
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any).message || errorResponse, // Tente de prendre .message s'il existe
      // Optionnel: Garder la description courte de l'erreur si disponible
      // error: (errorResponse as any)?.error || exception.message || 'Http Exception',
    };

    response.status(status).json(responseBody);
  }
}