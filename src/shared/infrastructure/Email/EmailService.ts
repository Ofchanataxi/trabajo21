import { EmailClientFactory } from './EmailFactory';
import { SendMailOptions } from 'nodemailer';
import { EmailStrategy } from './Strategies/EmailStrategy';
import { readFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import dotenv from 'dotenv';
import GetRequiredEnvVar from '../../utils/GetRequiredEnVar';
dotenv.config();
import { loadTemplate } from './Templates/loadTemplate';

export class MailService {
  private emailClient: EmailStrategy;

  constructor() {
    this.emailClient = EmailClientFactory.createClient();
  }

  async sendEmail(
    templateName: string,
    templateData: object,
    options: { to: string[]; subject: string },
    accessToken: string = 'null',
  ): Promise<void> {
    const template = loadTemplate(templateName);
    const htmlToSend = template(templateData);

    const completeMailOptions = {
      ...options,
      from: GetRequiredEnvVar('OFFICE_USER'),
      html: htmlToSend,
    };

    try {
      await this.emailClient.sendMail(completeMailOptions, accessToken);
      //console.log('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}
