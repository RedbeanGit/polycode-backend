import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from '../../core/guards/doesUserExist.guard';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any): Promise<{ user: User; token: string }> {
    const { user, token } = await this.authService.login(req.user);
    user.password = undefined;
    return { user, token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: any): Promise<void> {
    await this.authService.logout(req.user);
  }

  @UseGuards(DoesUserExist)
  @Post('register')
  async register(
    @Body() payload: UserDto,
  ): Promise<{ user: User; token: string }> {
    const { user, token } = await this.authService.register(payload);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user.password = undefined;
    return { user, token };
  }
}
