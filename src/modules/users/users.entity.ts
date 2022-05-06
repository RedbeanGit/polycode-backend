import {
  Table,
  Column,
  Model,
  Unique,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Session } from '../auth/auth.entity';
import {
  ExerciceSet,
  ExerciceSetProgress,
} from '../exercice-sets/exerciceSets.entity';
import { Exercice, ExerciceProgress } from '../exercices/exercices.entity';

@Table
export class User extends Model {
  @Column
  firstname: string;

  @Column
  lastname: string;

  @Unique
  @Column
  email: string;

  @Column
  password: string;

  @Column
  lastLogin: Date;

  @Column({
    defaultValue: false,
  })
  isAdmin: boolean;

  @HasMany(() => Exercice)
  exercicesCreated: Exercice[];

  @HasMany(() => ExerciceSet)
  exerciceSetsCreated: ExerciceSet[];

  @BelongsToMany(() => Exercice, () => ExerciceProgress)
  exercicesProgress: ExerciceProgress[];

  @BelongsToMany(() => ExerciceSet, () => ExerciceSetProgress)
  exerciceSetsProgress: ExerciceSetProgress[];

  @HasMany(() => Session, { onDelete: 'CASCADE' })
  sessions: Session[];
}
