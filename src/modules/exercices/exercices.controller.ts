import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { ExerciceDto, PartialExerciceDto } from './dto/exercice.dto';
import { ExercicesService } from './exercices.service';

@Controller('exercices')
export class ExercicesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly exercicesService: ExercicesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return await this.exercicesService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const exercice = await this.exercicesService.findOne(id);
    if (!exercice) {
      throw new NotFoundException('Exercice does not exist!');
    }
    return exercice;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async create(@Req() req, @Body() exercice: ExerciceDto) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can create exercices');
    }
    return await this.exercicesService.create(exercice);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: number,
    @Body() exercice: PartialExerciceDto,
  ) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can update exercices');
    }

    const { affectedCount, updatedExercice } =
      await this.exercicesService.update(id, exercice);
    if (affectedCount === 0) {
      throw new NotFoundException('Exercice does not exist!');
    } else {
      return updatedExercice;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: number) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can delete exercices');
    }

    const deletedCount = await this.exercicesService.delete(id);
    if (!deletedCount) {
      throw new NotFoundException('Exercice does not exist!');
    }
  }
}
