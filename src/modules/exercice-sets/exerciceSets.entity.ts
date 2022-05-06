import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Exercice } from '../exercices/exercices.entity';
import { User } from '../users/users.entity';

export enum ExerciceSetType {
  CHALLENGE = 'challenge',
  PRACTICE = 'practice',
}

@Table
export class ExerciceSet extends Model {
  @Column
  name: string;

  @Column
  description: string;

  @Column
  image: string;

  @Column
  type: ExerciceSetType;

  // associations
  @ForeignKey(() => User)
  @Column
  creatorId: number;

  @BelongsTo(() => User)
  creator: User;

  @HasMany(() => Exercice)
  exercices: Exercice[];

  @BelongsToMany(() => User, () => ExerciceSetProgress)
  progress: ExerciceSetProgress[];
}

@Table
export class ExerciceSetProgress extends Model {
  @ForeignKey(() => ExerciceSet)
  @Column
  exerciceSetId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  progress: number;
}
