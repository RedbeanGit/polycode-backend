import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { SESSION_REPOSITORY } from '../../core/constants';
import { Session } from './auth.entity';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionsRepository: typeof Session,
  ) {}

  public async login(user) {
    const loggedUser = await this.usersService.updateLastLogin(user.id);
    const token = await this.generateSession(loggedUser);
    return { user: loggedUser, token };
  }

  public async logout(user) {
    await this.sessionsRepository.destroy({ where: { userId: user.id } });
  }

  public async register(payload): Promise<any> {
    // create a new user
    const pass = await this.usersService.hashPassword(payload.password);
    const newUser = await this.usersService.create({
      ...payload,
      lastLogin: Date.now(),
      password: pass,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = await this.generateSession(newUser);

    return { user: newUser, token };
  }

  // utilitary methods
  async validateUser(email: string, pwd: string): Promise<any> {
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

  // sessions
  public async generateSession(user: User) {
    const token = uuidv4();
    const expireAt = this.createSessionExpirationDate();
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

  public async deleteSession(token: string) {
    await this.sessionsRepository.destroy({ where: { token } });
  }

  public async getSession(token: string) {
    const res = await this.sessionsRepository.findOne({
      where: { token },
      include: [{ model: User }],
    });
    return res ? res['dataValues'] : res;
  }

  private createSessionExpirationDate() {
    const date = new Date();
    date.setSeconds(date.getSeconds() + Number(process.env.TOKEN_EXPIRATION));
    return date;
  }
}
