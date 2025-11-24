import { EmailStrategy } from './EmailStrategy';
const nodemailer = require('nodemailer');
import { SendMailOptions, SentMessageInfo } from 'nodemailer';
import dotenv from 'dotenv';
import GetRequiredEnVar from '../../../utils/GetRequiredEnVar';
dotenv.config();

export class NodemailerStrategy implements EmailStrategy {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      pool: true,
      name: GetRequiredEnVar('OFFICE_HOST'),
      host: GetRequiredEnVar('OFFICE_HOST'), // <= your smtp server here
      port: 587, // <= connection port
      secureConnection: false,
      auth: {
        user: GetRequiredEnVar('OFFICE_USER'), // <= smtp login user
        pass: GetRequiredEnVar('OFFICE_PWD'), // <= smtp login pass
      },
      logger: true,
      debug: true,
      tls: {
        ciphers: 'SSLv3',
      },
    });

    // this.transporter = nodemailer.createTransport({
    //     host: GetRequiredEnVar('OFFICE_HOST'),
    //     port: GetRequiredEnVar('OFFICE_SMPT_NON_SECURE_PORT'),
    //     secure: false,
    //     auth: {
    //       user: GetRequiredEnVar('OFFICE_USER'),
    //       pass: GetRequiredEnVar('OFFICE_PWD'),
    //     },
    //   });
  }

  async sendMail(
    options: SendMailOptions,
    accessToken: string,
  ): Promise<SentMessageInfo> {
    return this.transporter.sendMail(options);
  }
}
