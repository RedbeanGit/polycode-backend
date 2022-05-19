import { Inject, Injectable } from '@nestjs/common';
import { Paginated } from 'src/core/pagination';
import {
  EXERCICE_PROGRESS_REPOSITORY,
  EXERCICE_SET_REPOSITORY,
} from '../../core/constants';
import { Exercice, ExerciceProgress } from '../exercices/exercices.entity';
import { User } from '../users/users.entity';
import { ExerciceSetDto, PartialExerciceSetDto } from './dto/exerciceSet.dto';
import { ExerciceSet, ExerciceSetType } from './exerciceSets.entity';

@Injectable()
export class ExerciceSetsService {
  async findAll(
    offset?: number,
    limit?: number,
    type?: ExerciceSetType,
  ): Promise<Paginated<ExerciceSet>> {
    let query;

    if (type) {
      query = {
        offset,
        limit,
        where: { type },
      };
    } else {
      query = { offset, limit };
    }

    const { rows, count } = await ExerciceSet.findAndCountAll(query);
    return new Paginated<ExerciceSet>(rows, rows.length, count);
  }

  async findOne(id: number): Promise<ExerciceSet> {
    const res = await ExerciceSet.findOne({
      where: { id },
      attributes: { exclude: ['creatorId'] },
      include: [
        {
          model: Exercice,
          as: 'exercices',
          attributes: { exclude: ['expectedOutput'] },
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });

    if (res) {
      const exerciceSet = res['dataValues'];
      exerciceSet.exercices = exerciceSet.exercices.map((exercice) =>
        exercice ? exercice['dataValues'] : exercice,
      );
      exerciceSet.creator = exerciceSet.creator
        ? exerciceSet.creator['dataValues']
        : exerciceSet.creator;
      return exerciceSet;
    }
    return res;
  }

  async create(exerciceSet: ExerciceSetDto): Promise<ExerciceSet> {
    return await ExerciceSet.create({ ...exerciceSet });
  }

  async update(
    id: number,
    exerciceSet: PartialExerciceSetDto,
  ): Promise<{ affectedCount: number; updatedExerciceSet: ExerciceSet }> {
    const [affectedCount, [res]] = await ExerciceSet.update(exerciceSet, {
      where: { id },
      returning: true,
    });
    const updatedExerciceSet = res['dataValues'];
    return { affectedCount, updatedExerciceSet };
  }

  async delete(id: number): Promise<number> {
    return await ExerciceSet.destroy({ where: { id } });
  }

  async calcProgress(id: number, userId: number): Promise<number> {
    const exerciceSet = await this.findOne(id);
    const exerciceIds: number[] = exerciceSet.exercices.map(
      (exercice) => exercice.id,
    );
    const res = await ExerciceProgress.findAll({
      where: { userId, exerciceId: exerciceIds },
    });
    const progresses = res.map((progress) =>
      progress ? progress['dataValues'] : progress,
    );
    let count = 0;
    let total = 0;
    progresses.forEach((progress) => {
      if (progress.success) {
        count++;
      }
      total++;
    });
    if (total) {
      return count / total;
    }
    return 0;
  }
}
