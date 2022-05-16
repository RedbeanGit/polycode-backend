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
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from 'src/core/guards/doesUserExist.guard';
import { Paginated, parseOffsetAndLimit } from 'src/core/pagination';
import { PartialUserDto, UserDto } from './dto/user.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Req() req: any,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ): Promise<Paginated<User>> {
    if (!req.user.isAdmin) {
      req.user.password = undefined;
      req.user.verificationCode = undefined;
      return new Paginated([req.user], 1, 1);
    }

    const parsedQuery = parseOffsetAndLimit(offset, limit);
    const paginated = await this.usersService.findAll(
      parsedQuery.offset,
      parsedQuery.limit,
    );
    return paginated.map<User>((user) => {
      user.password = undefined;
      user.verificationCode = undefined;
      return user;
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string): Promise<User> {
    if (!req.user.isAdmin && req.user.id !== +id) {
      throw new UnauthorizedException('Only admin can get other users!');
    }

    const user = await this.usersService.findOne(+id);

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    user.password = undefined;
    user.verificationCode = undefined;
    return user;
  }

  @UseGuards(AuthGuard('jwt'), DoesUserExist)
  @Put()
  @HttpCode(201)
  async create(@Req() req: any, @Body() payload: UserDto): Promise<User> {
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

    createdUser.password = undefined;
    createdUser.verificationCode = undefined;
    return createdUser;
  }

  @UseGuards(AuthGuard('jwt'), DoesUserExist)
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() payload: PartialUserDto,
  ): Promise<User> {
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

    updatedUser.password = undefined;
    updatedUser.verificationCode = undefined;
    return updatedUser;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(204)
  async delete(@Req() req: any, @Param('id') id: string): Promise<void> {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can delete users!');
    }

    const deletedCount = await this.usersService.delete(+id);
    if (!deletedCount) {
      throw new NotFoundException('No user deleted!');
    }
  }
}
