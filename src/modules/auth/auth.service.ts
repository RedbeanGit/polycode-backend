import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Session, VerificationCode } from './auth.entity';
import { User } from '../users/users.entity';
import { MailerService } from '../../core/mailer/mailer.service';
import { PartialUserDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  // session
  public async createSession(user: User): Promise<string> {
    const token = uuidv4();
    const expireAt = new Date();
    expireAt.setSeconds(
      expireAt.getSeconds() + Number(process.env.TOKEN_EXPIRATION),
    );
    Session.create({
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
    const res = await Session.findOne({
      where: { token },
      include: [{ model: User }],
    });
    return res ? res['dataValues'] : res;
  }

  public async deleteSession(token: string): Promise<void> {
    await Session.destroy({ where: { token } });
  }

  public async deleteSessionWithUser(user: User): Promise<void> {
    await Session.destroy({ where: { userId: user.id } });
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
    const res = await VerificationCode.create({
      token,
      userId,
      expireAt,
    });
    return res ? res['dataValues'] : res;
  }

  public async findOneVerificationCode(
    token: string,
  ): Promise<VerificationCode> {
    const res = await VerificationCode.findOne({
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
    await VerificationCode.destroy({ where: { userId } });
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
      `<h1>Polycode account verification</h1><a href="${process.env.APP_URL}/verify?code=${token}">Verify your account</a>`,
    );
  }

  public async verify(token: string): Promise<User> {
    const verificationCode = await this.findOneVerificationCode(token);

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid verification code');
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
