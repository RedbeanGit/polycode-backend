import { DEVELOPMENT, MAILER, PRODUCTION, TEST } from '../constants';
import { IMailerConfigAttributes } from './interfaces/mailerConfig.interface';
import { Transporter, createTransport } from 'nodemailer';
import { mailerConfig } from './mailer.config';

export const mailerProviders = [
  {
    provide: MAILER,
    useFactory: async (): Promise<Transporter> => {
      let config: IMailerConfigAttributes;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = mailerConfig.development;
          break;
        case TEST:
          config = mailerConfig.test;
          break;
        case PRODUCTION:
          config = mailerConfig.production;
          break;
        default:
          config = mailerConfig.development;
      }
      return createTransport(config);
    },
  },
];
