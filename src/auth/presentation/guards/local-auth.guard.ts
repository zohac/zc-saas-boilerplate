// src/auth/presentation/guards/local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that activates the Passport 'local' strategy.
 * It triggers the validate method in LocalStrategy.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
} // 'local' references the LocalStrategy
