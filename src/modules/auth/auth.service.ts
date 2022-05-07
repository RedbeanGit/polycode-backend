import * as bcrypt from 'bcrypt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  SESSION_REPOSITORY,
  VERIFICATION_CODE_REPOSITORY,
} from '../../core/constants';
import { Session, VerificationCode } from './auth.entity';
import { User } from '../users/users.entity';
import { MailerService } from '../../core/mailer/mailer.service';
import { PartialUserDto, UserDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionsRepository: typeof Session,
    @Inject(VERIFICATION_CODE_REPOSITORY)
    private readonly verificationCodesRepository: typeof VerificationCode,
  ) {}

  // session
  public async createSession(user: User): Promise<string> {
    const token = uuidv4();
    const expireAt = new Date();
    expireAt.setSeconds(
      expireAt.getSeconds() + Number(process.env.TOKEN_EXPIRATION),
    );
    this.sessionsRepository.create({
      token,
      userId: user.id,
      expireAt,
    });
    return await this.jwtService.signAsync({
      token,
      expireAt,
    });
  }

  public async findOneSession(token: string) {
    return await this.sessionsRepository.findOne({
      where: { token },
      include: [{ model: User }],
      raw: true,
    });
  }

  public async deleteSession(token: string): Promise<void> {
    await this.sessionsRepository.destroy({ where: { token } });
  }

  public async deleteSessionWithUser(user: User): Promise<void> {
    await this.sessionsRepository.destroy({ where: { userId: user.id } });
  }

  // session utilities
  public async validateUser(email: string, pwd: string): Promise<User> {
    // Get user from email
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return null;
    }

    // check if password is valid
    const match = await this.comparePassword(pwd, user.password);

    if (!match) {
      return null;
    }

    return user;
  }

  private async comparePassword(pwd: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pwd, hash);
  }

  // verification code
  public async createVerificationCode(
    token: string,
    expireAt: Date,
    userId: number,
  ): Promise<VerificationCode> {
    const res = await this.verificationCodesRepository.create({
      token,
      userId,
      expireAt,
    });
    return res ? res['dataValues'] : res;
  }

  public async findOneVerificationCode(
    token: string,
  ): Promise<VerificationCode> {
    const res = await this.verificationCodesRepository.findOne({
      where: { token },
      include: [{ model: User }],
    });

    // if no verification code found, return now
    if (!res) {
      return res;
    }

    const verificationCode = res['dataValues'];
    const user = verificationCode.user
      ? verificationCode.user['dataValues']
      : verificationCode.user;
    return { ...verificationCode, user };
  }

  public async deleteVerificationCodeWithUser(userId: number): Promise<void> {
    await this.verificationCodesRepository.destroy({ where: { userId } });
  }

  // verification utilities
  async sendVerificationEmail(user: User): Promise<void> {
    const token = uuidv4();
    const expireAt = new Date();
    expireAt.setSeconds(
      expireAt.getSeconds() + Number(process.env.VERIFICATION_CODE_EXPIRATION),
    );

    await this.createVerificationCode(token, expireAt, user.id);
    this.mailerService.sendMail(
      'polycode@polycode.ml',
      user.email,
      'Verify your account',
      `Please visit the following link to verify your account: ${process.env.APP_URL}/verify/${token}`,
      `<h1>Polycode account verification</h1><a href="${process.env.APP_URL}/verify/${token}">Verify your account</a>`,
    );
  }

  public async verify(email: string, token: string): Promise<User> {
    const verificationCode = await this.findOneVerificationCode(token);

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid verification code');
    }
    if (verificationCode.user.email != email) {
      throw new UnauthorizedException('Invalid email');
    }

    // we don't need the verification code anymore
    this.deleteVerificationCodeWithUser(verificationCode.user.id);

    if (verificationCode.expireAt < new Date()) {
      throw new UnauthorizedException('Verification code expired');
    }

    // update user to verified
    this.usersService.update(verificationCode.user.id, {
      isVerified: true,
    } as PartialUserDto);
    return verificationCode.user;
  }
}
