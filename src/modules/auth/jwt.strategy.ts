import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../users/users.entity';
import { Session } from './auth.entity';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { token: string; expireAt: Date }): Promise<User> {
    const session = await this.authService.getSession(payload.token);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (this.isExpired(session)) {
      await this.authService.deleteSession(session.token);
      throw new UnauthorizedException();
    }
    return session.user ? session.user['dataValues'] : session.user;
  }

  private isExpired(session: Session): boolean {
    const now = new Date();
    return now > session.expireAt;
  }
}
