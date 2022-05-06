import { IsEnum, IsNotEmpty } from 'class-validator';

export enum Language {
  RUST = 'rust',
  PYTHON = 'python',
  JAVA = 'java',
  JAVASCRIPT = 'javascript',
}

export class ExerciceTestDto {
  @IsEnum(Language)
  @IsNotEmpty()
  readonly language: Language;

  @IsNotEmpty()
  readonly editorContent: string;
}
