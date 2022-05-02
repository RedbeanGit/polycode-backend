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
import { ExerciceSetDto, PartialExerciceSetDto } from './dto/exerciceSet.dto';
import { ExerciceSetsService } from './exerciceSets.service';

@Controller('exercice-sets')
export class ExerciceSetsController {
  constructor(
    private readonly exerciceSetsService: ExerciceSetsService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return await this.exerciceSetsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const exerciceSet = await this.exerciceSetsService.findOne(id);
    if (!exerciceSet) {
      throw new NotFoundException();
    }
    return exerciceSet;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async create(@Req() req, @Body() exerciceSet: ExerciceSetDto) {
    const loggedUser = await this.usersService.findOne(req.user.id);
    if (!loggedUser.isAdmin) {
      throw new UnauthorizedException('Only admin can create exercice sets');
    }
    return await this.exerciceSetsService.create(exerciceSet);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: number,
    @Body() exerciceSet: PartialExerciceSetDto,
  ) {
    const loggedUser = await this.usersService.findOne(req.user.id);
    if (!loggedUser.isAdmin) {
      throw new UnauthorizedException('Only admin can update exercice sets');
    }

    const { affectedCount, updatedExerciceSet } =
      await this.exerciceSetsService.update(id, exerciceSet);
    if (!affectedCount) {
      throw new NotFoundException();
    }
    return updatedExerciceSet;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: number): Promise<any> {
    const loggedUser = await this.usersService.findOne(req.user.id);
    if (!loggedUser.isAdmin) {
      throw new UnauthorizedException('Only admin can delete exercice sets');
    }

    const deletedCount = await this.exerciceSetsService.delete(id);
    if (!deletedCount) {
      throw new NotFoundException();
    }
  }
}
