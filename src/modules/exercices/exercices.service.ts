import { Inject, Injectable } from '@nestjs/common';
import { Paginated } from 'src/core/pagination';
import {
  EXERCICE_PROGRESS_REPOSITORY,
  EXERCICE_REPOSITORY,
} from '../../core/constants';
import { User } from '../users/users.entity';
import { ExerciceDto, PartialExerciceDto } from './dto/exercice.dto';
import {
  ExerciceProgressDto,
  PartialExerciceProgressDto,
} from './dto/exerciceProgress.dto';
import { Exercice, ExerciceProgress } from './exercices.entity';

@Injectable()
export class ExercicesService {
  async findAll(offset?: number, limit?: number): Promise<Paginated<Exercice>> {
    const { rows, count } = await Exercice.findAndCountAll<Exercice>({
      offset,
      limit,
    });
    return new Paginated(
      rows.map((exercice) => (exercice ? exercice['dataValues'] : exercice)),
      rows.length,
      count,
    );
  }

  async findOne(id: number, userId?: number): Promise<Exercice> {
    const res = await Exercice.findOne<Exercice>({
      where: { id },
      attributes: { exclude: ['creatorId'] },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });
    const exercice = res ? res['dataValues'] : res;

    // if a user is provided, we want to include the progress
    if (userId) {
      const progress = await this.getProgress(id, userId);

      if (progress) {
        return { ...exercice, progress };
      }
    }
    return exercice;
  }

  async create(exercice: ExerciceDto): Promise<Exercice> {
    const res = await Exercice.create<Exercice>({ ...exercice });
    return res ? res['dataValues'] : res;
  }

  async update(
    id: number,
    exercice: PartialExerciceDto,
  ): Promise<{ affectedCount: number; updatedExercice: Exercice }> {
    const [affectedCount, [res]] = await Exercice.update<Exercice>(exercice, {
      where: { id },
      returning: true,
    });
    const updatedExercice = res ? res['dataValues'] : res;
    return { affectedCount, updatedExercice };
  }

  async delete(id: number): Promise<number> {
    return await Exercice.destroy<Exercice>({ where: { id } });
  }

  async getProgress(
    exerciceId: number,
    userId: number,
  ): Promise<ExerciceProgress> {
    const res = await ExerciceProgress.findOne<ExerciceProgress>({
      where: { exerciceId, userId },
    });
    return res ? res['dataValues'] : res;
  }

  async createProgress(
    exerciceProgress: ExerciceProgressDto,
  ): Promise<ExerciceProgress> {
    const res = await ExerciceProgress.create<ExerciceProgress>({
      ...exerciceProgress,
    });
    return res ? res['dataValues'] : res;
  }

  async updateProgress(
    exerciceId: number,
    userId: number,
    exerciceProgress: PartialExerciceProgressDto,
  ): Promise<{
    affectedCount: number;
    updatedExerciceProgress: ExerciceProgress;
  }> {
    const [affectedCount, [res]] =
      await ExerciceProgress.update<ExerciceProgress>(exerciceProgress, {
        where: {
          exerciceId: exerciceId,
          userId: userId,
        },
        returning: true,
      });
    const updatedExerciceProgress = res ? res['dataValues'] : res;
    return { affectedCount, updatedExerciceProgress };
  }
}
