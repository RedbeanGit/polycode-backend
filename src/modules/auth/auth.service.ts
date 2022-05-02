import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pwd: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return null;
    }

    const match = await this.comparePassword(pwd, user.password);

    if (!match) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  public async login(user) {
    const loggedUser = await this.usersService.updateLastLogin(user.id);
    const token = await this.generateToken(user);
    return { loggedUser, token };
  }

  public async register(payload): Promise<any> {
    const pass = await this.usersService.hashPassword(payload.password);
    const lastLogin = Date.now();
    const newUser = await this.usersService.create({
      ...payload,
      lastLogin,
      password: pass,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = newUser;
    const token = await this.generateToken(user);
    return { user: user, token };
  }

  // utilitary methods
  private async comparePassword(pwd: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pwd, hash);
  }

  private async generateToken(user): Promise<string> {
    return await this.jwtService.signAsync(user);
  }
}
