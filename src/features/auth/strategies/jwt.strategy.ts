import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { jwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../types/jwt-payload.type';

// Cookie name constant (should match what's in auth.controller.ts)
const COOKIE_NAME = 'reactivity-token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      // Extract JWT from cookies instead of Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.[COOKIE_NAME] || null;
        },
      ]),
      secretOrKey: config.secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    return this.authService.validateJwt(payload);
  }
}
