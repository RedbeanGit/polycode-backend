import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from '../../core/guards/doesUserExist.guard';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    const { user, token } = await this.authService.login(req.user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...filteredUser } = user;
    return { filteredUser, token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.logout(req.user);
  }

  @UseGuards(DoesUserExist)
  @Post('register')
  async register(@Body() payload: UserDto) {
    const { user, token } = await this.authService.register(payload);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...filteredUser } = user;
    return { filteredUser, token };
  }
}
