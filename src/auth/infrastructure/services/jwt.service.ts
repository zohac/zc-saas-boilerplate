// src/auth/infrastructure/services/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt'; // Alias pour éviter la collision de noms
import { IJwtService } from '../../application/ports/jwt-service.interface';

@Injectable()
export class JwtService implements IJwtService {
  private readonly jwtSecret: string;
  private readonly defaultExpiresIn: string;

  constructor(
    // Injecter le service JWT fourni par @nestjs/jwt
    private readonly nestJwtService: NestJwtService,
    // Injecter ConfigService pour obtenir les paramètres
    private readonly configService: ConfigService,
  ) {
    const secretFromEnv = this.configService.get<string>('JWT_SECRET');
    if (!secretFromEnv) {
      // Lever une erreur si manquant
      throw new Error('JWT_SECRET environment variable is not defined. Application cannot start.');
    }

    this.jwtSecret = secretFromEnv;

    // Récupérer l'expiration par défaut (ex: '3600s' ou '1h')
    this.defaultExpiresIn = this.configService.get<string>('JWT_EXPIRATION_TIME', '3600s'); // Default to 1 hour
  }

  /**
   * Implémente la signature JWT en utilisant le service @nestjs/jwt.
   */
  async sign(payload: Record<string, any>, expiresIn?: string): Promise<string> {
    const effectiveExpiresIn = expiresIn ?? this.defaultExpiresIn;
    console.log(`Signing JWT with payload: ${JSON.stringify(payload)}, expires in: ${effectiveExpiresIn}`); // Debug log

    try {
      const token = await this.nestJwtService.signAsync(payload, {
        secret: this.jwtSecret, // Utilise le secret chargé
        expiresIn: effectiveExpiresIn, // Utilise l'expiration fournie ou la valeur par défaut
      });
      console.log(`Generated Token (first 10 chars): ${token.substring(0, 10)}...`); // Debug log
      return token;
    } catch (error) {
      console.error('Error signing JWT:', error); // Log d'erreur détaillé
      throw new Error(`Failed to sign JWT: ${error.message}`); // Relancer une erreur plus générique ou spécifique
    }
  }

  /**
   * Implémente la vérification JWT en utilisant le service @nestjs/jwt.
   */
  async verify(token: string): Promise<Record<string, any>> {
    console.log(`Verifying JWT (first 10 chars): ${token.substring(0, 10)}...`); // Debug log
    try {
      const payload = await this.nestJwtService.verifyAsync(token, {
        secret: this.jwtSecret, // Utilise le même secret pour vérifier
      });
      console.log(`JWT Verification successful. Payload: ${JSON.stringify(payload)}`); // Debug log
      return payload;
    } catch (error) {
      console.error(`JWT Verification failed: ${error.message}`); // Log d'erreur détaillé
      // L'erreur d'origine (ex: TokenExpiredError, JsonWebTokenError) sera relancée
      // par NestJS et potentiellement interceptée par les gardes ou filtres.
      throw error; // Relancer l'erreur originale (ex: TokenExpiredError)
    }
  }
}
