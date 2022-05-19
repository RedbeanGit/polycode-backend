import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from 'src/core/mailer/mailer.module';
import { MailerService } from 'src/core/mailer/mailer.service';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.TOKEN_EXPIRATION) },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, MailerService],
  controllers: [AuthController],
})
export class AuthModule {}
