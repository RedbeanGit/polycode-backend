import {
  SESSION_REPOSITORY,
  VERIFICATION_CODE_REPOSITORY,
} from '../../core/constants';
import { Session, VerificationCode } from './auth.entity';

export const authProviders = [
  {
    provide: SESSION_REPOSITORY,
    useValue: Session,
  },
  {
    provide: VERIFICATION_CODE_REPOSITORY,
    useValue: VerificationCode,
  },
];
