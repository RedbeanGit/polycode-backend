import { USER_REPOSITORY } from '../../core/constants';
import { User } from './users.entity';

export const usersProviders = [
  {
    provide: USER_REPOSITORY,
    useValue: User,
  },
];
