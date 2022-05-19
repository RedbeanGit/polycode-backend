import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ExerciceSet } from '../exercice-sets/exerciceSets.entity';
import { User } from '../users/users.entity';

@Table
export class Exercice extends Model {
  @Column
  name: string;

  @Column
  statement: string;

  @Column
  baseEditorContent: string;

  @Column
  expectedOutput: string;

  // associations
  @ForeignKey(() => User)
  @Column
  creatorId: number;

  @BelongsTo(() => User)
  creator: User;

  @BelongsToMany(() => User, () => ExerciceProgress)
  userProgress: User[];

  @ForeignKey(() => ExerciceSet)
  @Column
  exerciceSetId: number;

  @BelongsTo(() => ExerciceSet)
  exerciceSet: ExerciceSet;
}

@Table
export class ExerciceProgress extends Model {
  @ForeignKey(() => Exercice)
  @Column
  exerciceId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  editorContent: string;

  @Column
  success: boolean;
}
