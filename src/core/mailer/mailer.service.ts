import { Inject, Injectable } from '@nestjs/common';
import { MAILER } from '../constants';

@Injectable()
export class MailerService {
  constructor(@Inject(MAILER) private readonly transporter) {}

  public async sendMail(
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    await this.transporter.sendMail({ from, to, subject, text, html });
  }
}
