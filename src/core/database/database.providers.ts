import { Sequelize } from 'sequelize-typescript';
import {
  ExerciceSet,
  ExerciceSetProgress,
} from '../../modules/exercice-sets/exerciceSets.entity';
import {
  Exercice,
  ExerciceProgress,
} from '../../modules/exercices/exercices.entity';
import { User } from '../../modules/users/users.entity';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
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
      const sequelize = new Sequelize({ ...config, logging: false });
      sequelize.addModels([
        ExerciceSet,
        ExerciceSetProgress,
        Exercice,
        ExerciceProgress,
        User,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
