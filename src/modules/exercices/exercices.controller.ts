import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Paginated, parseOffsetAndLimit } from 'src/core/pagination';
import { RunnersService } from 'src/core/runners/runners.service';
import { ExerciceDto, PartialExerciceDto } from './dto/exercice.dto';
import { PartialExerciceProgressDto } from './dto/exerciceProgress.dto';
import { ExerciceTestDto, Language } from './dto/exerciceTest.dto';
import { Exercice } from './exercices.entity';
import { ExercicesService } from './exercices.service';

@Controller('exercices')
export class ExercicesController {
  constructor(
    private readonly exercicesService: ExercicesService,
    private readonly runnersService: RunnersService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ): Promise<Paginated<Exercice>> {
    const parsedQuery = parseOffsetAndLimit(offset, limit);
    const paginated = await this.exercicesService.findAll(
      parsedQuery.offset,
      parsedQuery.limit,
    );
    return paginated.map<Exercice>((exercice) => {
      exercice.expectedOutput = undefined;
      return exercice;
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: number): Promise<Exercice> {
    const exercice = await this.exercicesService.findOne(id, req.user.id);
    if (!exercice) {
      throw new NotFoundException('Exercice does not exist!');
    }
    exercice.expectedOutput = undefined;
    return exercice;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async create(
    @Req() req: any,
    @Body() exercice: ExerciceDto,
  ): Promise<Exercice> {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can create exercices');
    }
    const createdExercice = await this.exercicesService.create(exercice);
    createdExercice.expectedOutput = undefined;
    return createdExercice;
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: number,
    @Body() exercice: PartialExerciceDto,
  ): Promise<Exercice> {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can update exercices');
    }

    const { affectedCount, updatedExercice } =
      await this.exercicesService.update(id, exercice);
    if (affectedCount === 0) {
      throw new NotFoundException('Exercice does not exist!');
    } else {
      updatedExercice.expectedOutput = undefined;
      return updatedExercice;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: number): Promise<void> {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Only admin can delete exercices');
    }

    const deletedCount = await this.exercicesService.delete(id);
    if (!deletedCount) {
      throw new NotFoundException('Exercice does not exist!');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/test')
  async test(
    @Req() req: any,
    @Param('id') id: number,
    @Body() payload: ExerciceTestDto,
  ): Promise<{ success: boolean; stdout: string; stderr: string }> {
    const exercice = await this.exercicesService.findOne(id);

    if (!exercice) {
      throw new NotFoundException('Exercice does not exist!');
    }

    const { language, editorContent } = payload;
    let image, command, realEditorContent;
    switch (language) {
      case Language.RUST:
        image = 'rust:1.60';
        command = 'rustc app.rs ; ./app';
        realEditorContent = { name: 'app.rs', content: editorContent };
        break;
      case Language.PYTHON:
        image = 'python:3.10';
        command = 'python app.py';
        realEditorContent = { name: 'app.py', content: editorContent };
        break;
      case Language.JAVA:
        image = 'openjdk:18.0';
        command = 'java Main.java';
        realEditorContent = { name: 'Main.java', content: editorContent };
        break;
      case Language.JAVASCRIPT:
        image = 'node:18.1';
        command = 'node app.js';
        realEditorContent = { name: 'app.js', content: editorContent };
        break;
    }

    const { stdout, stderr } = await this.runnersService.run(image, command, [
      realEditorContent,
    ]);
    const progress = this.exercicesService.getProgress(
      exercice.id,
      req.user.id,
    );

    if (stdout.trim() !== exercice.expectedOutput.trim()) {
      if (progress) {
        this.exercicesService.updateProgress(exercice.id, req.user.id, {
          editorContent,
        } as PartialExerciceProgressDto);
      } else {
        this.exercicesService.createProgress({
          userId: req.user.id,
          exerciceId: id,
          editorContent,
          success: false,
        });
      }
      return { success: false, stdout, stderr };
    }
    if (progress) {
      this.exercicesService.updateProgress(exercice.id, req.user.id, {
        success: true,
        editorContent,
      } as PartialExerciceProgressDto);
    } else {
      this.exercicesService.createProgress({
        userId: req.user.id,
        exerciceId: id,
        editorContent,
        success: true,
      });
    }
    return { success: true, stdout, stderr };
  }
}
