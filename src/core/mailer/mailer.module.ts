import { Module } from '@nestjs/common';
import { mailerProviders } from './mailer.providers';

@Module({
  providers: [...mailerProviders],
  exports: [...mailerProviders],
})
export class MailerModule {}
