import * as dotenv from 'dotenv';
import { IMailerConfig } from './interfaces/mailerConfig.interface';

dotenv.config();

export const mailerConfig: IMailerConfig = {
  development: {
    host: process.env.MAILER_HOST,
    port: Number(process.env.MAILER_PORT),
    secure: false,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  },
  test: {
    host: process.env.MAILER_HOST,
    port: Number(process.env.MAILER_PORT),
    secure: false,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  },
  production: {
    host: process.env.MAILER_HOST,
    port: Number(process.env.MAILER_PORT),
    secure: true,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  },
};
