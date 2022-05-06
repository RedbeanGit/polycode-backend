import { IsNotEmpty } from 'class-validator';

export class ExerciceDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly statement: string;

  @IsNotEmpty()
  readonly expectedOutput: string;

  readonly baseEditorContent: string;

  @IsNotEmpty()
  readonly creatorId: number;

  @IsNotEmpty()
  readonly exerciceSetId: number;
}

export class PartialExerciceDto {
  readonly name: string;
  readonly statement: string;
  readonly expectedOutput: string;
  readonly baseEditorContent: string;
  readonly creatorId: number;
  readonly exerciceSetId: number;
}
