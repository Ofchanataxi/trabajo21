import { EmailStrategy } from './EmailStrategy';
const nodemailer = require('nodemailer');
import { SendMailOptions, SentMessageInfo } from 'nodemailer';
import dotenv from 'dotenv';
import GetRequiredEnVar from '../../../utils/GetRequiredEnVar';
dotenv.config();

import HttpClient from '../../../utils/HttpClient';

export class Office365Strategy implements EmailStrategy {
  constructor() {}

  sendEmailOffice = async (
    accessToken: any,
    correo: string[],
    html: any,
    subject: string,
  ) => {
    const url = 'https://graph.microsoft.com/v1.0/me/sendMail';

    let correos: object[] = [];

    for (let i = 0; i < correo.length; i++) {
      const element = correo[i];

      let auxObj = {
        emailAddress: {
          address: element,
        },
      };

      correos.push(auxObj);
    }
    const data = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: html,
        },
        toRecipients: correos,
      },
      saveToSentItems: 'true',
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await HttpClient(url, data, accessToken);
      console.log('Email sent successfully!', response.data);
      return true;
    } catch (error: unknown) {
      console.log('Error enviando correo',error);
      throw new Error('Error al enviar el correo desde office 365');
    }
  };

  async sendMail(
    options: { to: string[]; subject: string; html: string },
    accessToken: string,
  ): Promise<any> {
    const to = options.to;
    const subject = options.subject;
    const html = options.html;
    return this.sendEmailOffice(accessToken, to, html, subject);
  }
}
