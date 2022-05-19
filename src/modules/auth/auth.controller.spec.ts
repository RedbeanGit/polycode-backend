import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerModule } from '../../core/mailer/mailer.module';
import { MailerService } from '../../core/mailer/mailer.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { authProviders } from './auth.providers';
import { databaseProviders } from '../../core/database/database.providers';
import { Sequelize } from 'sequelize-typescript';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule,
        UsersModule,
        MailerModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: Number(process.env.TOKEN_EXPIRATION) },
        }),
      ],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        MailerService,
        ...authProviders,
        ...databaseProviders,
      ],
      controllers: [AuthController],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    authController = moduleRef.get<AuthController>(AuthController);
  });

  afterAll(async () => await moduleRef.get<Sequelize>(Sequelize).close());

  describe('login', () => {
    it('should login a verified user', async () => {
      jest
        .spyOn(authService, 'createSession')
        .mockReturnValue(new Promise<string>(() => 'testtoken'));
      const user = {
        firstname: 'julien',
        lastname: 'dubois',
        email: 'test@example.com',
        password: 'testpass',
      };
      const request = {
        user,
      };
      const result = {
        user: {
          firstname: 'julien',
          lastname: 'dubois',
          email: 'test@example.com',
          password: 'testpass',
        },
        token: 'testtoken',
      };
      expect(await authController.login(request)).toBe(result);
    });
  });
});
