import { EXERCICE_REPOSITORY } from '../../core/constants';
import { Exercice } from './exercices.entity';

export const exercicesProviders = [
  {
    provide: EXERCICE_REPOSITORY,
    useValue: Exercice,
  },
];
