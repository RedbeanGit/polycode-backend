import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from '../../core/guards/doesUserExist.guard';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any): Promise<{ user: User; token: string }> {
    const user = await this.usersService.updateLastLogin(req.user.id);
    const token = await this.authService.createSession(user);
    user.password = undefined;
    user.verificationCode = undefined;
    return { user, token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: any): Promise<void> {
    await this.authService.deleteSessionWithUser(req.user);
  }

  @UseGuards(DoesUserExist)
  @Post('register')
  async register(@Body() payload: UserDto): Promise<User> {
    const user = await this.usersService.create({
      ...payload,
      lastLogin: new Date(),
      isVerified: false,
    });

    await this.authService.sendVerificationEmail(user);

    user.password = undefined;
    user.verificationCode = undefined;
    return user;
  }

  @Post('verify')
  async verify(
    @Body() payload: { email: string; code: string },
  ): Promise<{ user: User; token: string }> {
    const verifiedUser = await this.authService.verify(
      payload.email,
      payload.code,
    );
    return await this.login({ user: verifiedUser });
  }

  @Post('verify/resend')
  async resendVerificationCode(
    @Body() payload: { email: string },
  ): Promise<void> {
    const user = await this.usersService.findOneByEmail(payload.email);
    await this.authService.sendVerificationEmail(user);
  }
}
