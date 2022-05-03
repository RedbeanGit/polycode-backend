import { SESSION_REPOSITORY } from '../../core/constants';
import { Session } from './auth.entity';

export const authProviders = [
  {
    provide: SESSION_REPOSITORY,
    useValue: Session,
  },
];
