import { Inject, Injectable } from '@nestjs/common';
import { Paginated } from 'src/core/pagination';
import { EXERCICE_SET_REPOSITORY } from '../../core/constants';
import { Exercice } from '../exercices/exercices.entity';
import { User } from '../users/users.entity';
import { ExerciceSetDto, PartialExerciceSetDto } from './dto/exerciceSet.dto';
import { ExerciceSet } from './exerciceSets.entity';

@Injectable()
export class ExerciceSetsService {
  constructor(
    @Inject(EXERCICE_SET_REPOSITORY)
    private readonly exerciceSetsRepository: typeof ExerciceSet,
  ) {}

  async findAll(
    offset?: number,
    limit?: number,
  ): Promise<Paginated<ExerciceSet>> {
    const total = await this.exerciceSetsRepository.count();
    const { rows, count } = await this.exerciceSetsRepository.findAndCountAll({
      offset,
      limit,
    });
    return new Paginated<ExerciceSet>(rows, count, total);
  }

  async findOne(id: number): Promise<ExerciceSet> {
    return await this.exerciceSetsRepository.findOne({
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
  }

  async create(exerciceSet: ExerciceSetDto): Promise<ExerciceSet> {
    return await this.exerciceSetsRepository.create({ ...exerciceSet });
  }

  async update(
    id: number,
    exerciceSet: PartialExerciceSetDto,
  ): Promise<{ affectedCount: number; updatedExerciceSet: ExerciceSet }> {
    const [affectedCount, [res]] = await this.exerciceSetsRepository.update(
      exerciceSet,
      {
        where: { id },
        returning: true,
      },
    );
    const updatedExerciceSet = res['dataValues'];
    return { affectedCount, updatedExerciceSet };
  }

  async delete(id: number): Promise<number> {
    return await this.exerciceSetsRepository.destroy({ where: { id } });
  }
}
