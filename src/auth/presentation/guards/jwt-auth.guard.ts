// src/auth/presentation/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that activates the Passport 'jwt' strategy.
 * It triggers the validate method in JwtStrategy after verifying token signature/expiration.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
} // 'jwt' references the JwtStrategy
