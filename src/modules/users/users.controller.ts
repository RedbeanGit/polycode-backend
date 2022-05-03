import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from 'src/core/guards/doesUserExist.guard';
import { PartialUserDto, UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req) {
    if (!req.user.isAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...filteredUser } = req.user;
      return [filteredUser];
    }

    const users = await this.usersService.findAll();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...filteredUser } = user;
      return filteredUser;
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    if (!req.user.isAdmin && req.user.id !== +id) {
      throw new UnauthorizedException('Only admin can get other users!');
    }

    const user = await this.usersService.findOne(+id);

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...filteredUser } = user;
    return filteredUser;
  }

  @UseGuards(AuthGuard('jwt'), DoesUserExist)
  @Put()
  @HttpCode(201)
  async create(@Req() req, @Body() payload: UserDto) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can create users!');
    }

    const hashedPassword = await this.usersService.hashPassword(
      payload.password,
    );

    const createdUser = await this.usersService.create({
      ...payload,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...filteredUser } = createdUser;
    return filteredUser;
  }

  @UseGuards(AuthGuard('jwt'), DoesUserExist)
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() payload: PartialUserDto,
  ): Promise<any> {
    if (!req.user.isAdmin) {
      if (req.user.id !== +id) {
        throw new UnauthorizedException('Only admin can update other users!');
      }
      if (payload.isAdmin !== undefined) {
        throw new UnauthorizedException('Only admin can update isAdmin field!');
      }
    }

    const hashedPassword = await this.usersService.hashPassword(
      payload.password,
    );
    const { affectedCount, updatedUser } = await this.usersService.update(+id, {
      ...payload,
      password: hashedPassword,
    });

    if (affectedCount === 0) {
      throw new NotFoundException('No user updated!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...filteredUser } = updatedUser;
    return filteredUser;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(204)
  async delete(@Req() req, @Param('id') id: string) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can delete users!');
    }

    const deletedCount = await this.usersService.delete(+id);
    if (!deletedCount) {
      throw new NotFoundException('No user deleted!');
    }
  }
}
