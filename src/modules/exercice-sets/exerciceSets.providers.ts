import { EXERCICE_SET_REPOSITORY } from '../../core/constants';
import { ExerciceSet } from './exerciceSets.entity';

export const exerciceSetProviders = [
  {
    provide: EXERCICE_SET_REPOSITORY,
    useValue: ExerciceSet,
  },
];
