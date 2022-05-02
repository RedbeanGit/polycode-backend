import { Inject, Injectable } from '@nestjs/common';
import { EXERCICE_REPOSITORY } from '../../core/constants';
import { User } from '../users/users.entity';
import { ExerciceDto, PartialExerciceDto } from './dto/exercice.dto';
import { Exercice } from './exercices.entity';

@Injectable()
export class ExercicesService {
  constructor(
    @Inject(EXERCICE_REPOSITORY)
    private readonly exerciceRepository: typeof Exercice,
  ) {}

  async findAll(): Promise<Exercice[]> {
    return await this.exerciceRepository.findAll<Exercice>();
  }

  async findOne(id: number): Promise<Exercice> {
    return await this.exerciceRepository.findOne<Exercice>({
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
  }

  async create(exercice: ExerciceDto): Promise<Exercice> {
    return await this.exerciceRepository.create<Exercice>({ ...exercice });
  }

  async update(id: number, exercice: PartialExerciceDto) {
    const [affectedCount, [res]] =
      await this.exerciceRepository.update<Exercice>(exercice, {
        where: { id },
        returning: true,
      });
    const updatedExercice = res ? res['dataValues'] : res;
    return { affectedCount, updatedExercice };
  }

  async delete(id: number): Promise<number> {
    return await this.exerciceRepository.destroy<Exercice>({ where: { id } });
  }
}
