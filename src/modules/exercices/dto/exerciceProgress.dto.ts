import { IsNotEmpty } from 'class-validator';

export class ExerciceProgressDto {
  @IsNotEmpty()
  readonly exerciceId: number;

  @IsNotEmpty()
  readonly userId: number;

  @IsNotEmpty()
  readonly success: boolean;

  @IsNotEmpty()
  readonly editorContent: string;
}

export class PartialExerciceProgressDto {
  readonly success: boolean;
  readonly editorContent: string;
}
