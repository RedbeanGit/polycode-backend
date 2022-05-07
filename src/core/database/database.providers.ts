import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Session, VerificationCode } from '../../modules/auth/auth.entity';
import {
  ExerciceSet,
  ExerciceSetProgress,
} from '../../modules/exercice-sets/exerciceSets.entity';
import {
  Exercice,
  ExerciceProgress,
} from '../../modules/exercices/exercices.entity';
import { User } from '../../modules/users/users.entity';
import { DEVELOPMENT, PRODUCTION, SEQUELIZE, TEST } from '../constants';
import { databaseConfig } from './database.config';
import { IDatabaseConfigAttributes } from './interfaces/dbConfig.interface';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async (): Promise<Sequelize> => {
      let config: IDatabaseConfigAttributes;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize({
        ...config,
        logging: false,
      } as SequelizeOptions);
      sequelize.addModels([
        ExerciceSet,
        ExerciceSetProgress,
        Exercice,
        ExerciceProgress,
        Session,
        VerificationCode,
        User,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
