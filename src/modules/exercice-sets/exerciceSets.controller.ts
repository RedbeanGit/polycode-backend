import {
  Body,
  Controller,
  Delete,
  Get,
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
import { Paginated, parseOffsetAndLimit } from 'src/core/pagination';
import { ExerciceSetDto, PartialExerciceSetDto } from './dto/exerciceSet.dto';
import { ExerciceSet, ExerciceSetType } from './exerciceSets.entity';
import { ExerciceSetsService } from './exerciceSets.service';

@Controller('exercice-sets')
export class ExerciceSetsController {
  constructor(private readonly exerciceSetsService: ExerciceSetsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('spotlight')
  async findSpotlight(): Promise<ExerciceSet> {
    const { data, total } = await this.exerciceSetsService.findAll();

    if (total === 0) {
      throw new NotFoundException('No exercice sets found');
    }

    const randomIndex = Math.floor(Math.random() * total);
    return data[randomIndex];
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/progress')
  async findProgress(
    @Req() req: any,
    @Param('id') id: number,
  ): Promise<number> {
    return await this.exerciceSetsService.calcProgress(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: ExerciceSetType,
  ): Promise<Paginated<ExerciceSet>> {
    const parsedQuery = parseOffsetAndLimit(offset, limit);
    return await this.exerciceSetsService.findAll(
      parsedQuery.offset,
      parsedQuery.limit,
      type,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ExerciceSet> {
    const exerciceSet = await this.exerciceSetsService.findOne(id);
    if (!exerciceSet) {
      throw new NotFoundException();
    }
    return exerciceSet;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async create(
    @Req() req: any,
    @Body() exerciceSet: ExerciceSetDto,
  ): Promise<ExerciceSet> {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can create exercice sets');
    }
    return await this.exerciceSetsService.create(exerciceSet);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: number,
    @Body() exerciceSet: PartialExerciceSetDto,
  ): Promise<ExerciceSet> {
    if (!req.user.isAdmin) {
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
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can delete exercice sets');
    }

    const deletedCount = await this.exerciceSetsService.delete(id);
    if (!deletedCount) {
      throw new NotFoundException();
    }
  }
}
