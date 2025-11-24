import { SendMailOptions, SentMessageInfo } from 'nodemailer';

export interface EmailStrategy {
  sendMail(
    options: { to: string[]; subject: string; html: string; from: string },
    accessToken: string,
  ): Promise<SentMessageInfo>;
}
