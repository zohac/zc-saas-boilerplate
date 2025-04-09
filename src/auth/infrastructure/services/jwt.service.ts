// src/auth/infrastructure/services/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

// Importer l'interface et le type de payload
import {
  BaseJwtPayload,
  IJwtService,
} from '../../application/ports/jwt-service.interface';

@Injectable()
export class JwtService implements IJwtService {
  private readonly jwtSecret: string;
  private readonly defaultExpiresIn: string;

  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    const secretFromEnv = this.configService.get<string>('JWT_SECRET');
    if (!secretFromEnv) {
      throw new Error(
        'JWT_SECRET environment variable is not defined. Application cannot start.',
      );
    }

    this.jwtSecret = secretFromEnv;
    this.defaultExpiresIn = this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
      '3600s',
    );
  }

  async sign(
    payload: Record<string, unknown>,
    expiresIn?: string,
  ): Promise<string> {
    const effectiveExpiresIn = expiresIn ?? this.defaultExpiresIn;
    console.log(
      `Signing JWT with payload: ${JSON.stringify(payload)}, expires in: ${effectiveExpiresIn}`,
    );

    try {
      const token = await this.nestJwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: effectiveExpiresIn,
      });
      console.log(
        `Generated Token (first 10 chars): ${token.substring(0, 10)}...`,
      );
      return token;
    } catch (error) {
      console.error('Error signing JWT:', error);
      // Vérifier le type de l'erreur pour extraire le message
      const message =
        error instanceof Error ? error.message : 'Unknown signing error';
      throw new Error(`Failed to sign JWT: ${message}`);
    }
  }

  async verify(token: string): Promise<BaseJwtPayload> {
    console.log(`Verifying JWT (first 10 chars): ${token.substring(0, 10)}...`);
    try {
      // Spécifier le type attendu avec le générique de verifyAsync
      const payload = await this.nestJwtService.verifyAsync<BaseJwtPayload>(
        token,
        {
          secret: this.jwtSecret,
        },
      );
      console.log(
        `JWT Verification successful. Payload: ${JSON.stringify(payload)}`,
      );
      return payload; // Le type est maintenant correct
    } catch (error) {
      // Vérifier le type de l'erreur pour le log
      const message =
        error instanceof Error ? error.message : 'Unknown verification error';
      console.error(`JWT Verification failed: ${message}`);
      // Relancer l'erreur originale
      throw error;
    }
  }
}
