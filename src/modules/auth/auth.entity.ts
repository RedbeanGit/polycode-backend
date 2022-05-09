import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';

@Table({ timestamps: false })
export class Session extends Model {
  @Column({ primaryKey: true })
  token: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  expireAt: Date;
}

@Table({ timestamps: false })
export class VerificationCode extends Model {
  @Column({ primaryKey: true })
  token: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  expireAt: Date;
}
