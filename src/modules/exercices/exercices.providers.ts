import {
  EXERCICE_PROGRESS_REPOSITORY,
  EXERCICE_REPOSITORY,
} from '../../core/constants';
import { Exercice, ExerciceProgress } from './exercices.entity';

export const exercicesProviders = [
  {
    provide: EXERCICE_REPOSITORY,
    useValue: Exercice,
  },
  {
    provide: EXERCICE_PROGRESS_REPOSITORY,
    useValue: ExerciceProgress,
  },
];
