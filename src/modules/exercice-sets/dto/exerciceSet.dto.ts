import { IsEnum, IsNotEmpty } from 'class-validator';
import { ExerciceSetType } from '../exerciceSets.entity';

export class ExerciceSetDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly description: string;

  readonly image: string;

  @IsNotEmpty()
  @IsEnum(ExerciceSetType)
  readonly type: ExerciceSetType;

  @IsNotEmpty()
  readonly creatorId: number;
}

export class PartialExerciceSetDto {
  readonly name: string;
  readonly description: string;
  readonly image: string;
  readonly type: ExerciceSetType;
  readonly creatorId: number;
}
