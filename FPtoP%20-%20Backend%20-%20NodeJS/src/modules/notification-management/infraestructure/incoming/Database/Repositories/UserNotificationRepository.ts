import { MailService } from '../../../../../../shared/infrastructure/Email/EmailService';
import { TeamsChatService } from '../../../../../../shared/infrastructure/TeamsChat/TeamsChatService';
import { NotificationRepository } from '../../../../domain/repositories/NotificationRepository';

export class UserNotificationRepository implements NotificationRepository {
  //Notificacines para la creacion de Releases
  notification(req: any, dataReceived: any): Promise<any> {
    const officeMailer = new MailService();
    const teamsChat = new TeamsChatService();
    const token = req.session.accessToken;

    const configNotificator: any = {
      1: [
        {
          StandardTemplateNotification: {
            templateEmail: 'UploadedReleaseSLBTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail: 'Copia | FP2P | Actualización de información de Pozo',
          },
          StandardNotifiedUsers: {
            users: ['adm-oloor@slb.com', 'OLoor@slb.com'], // Para no enviar correos usar --- users: [],
          },
        },
        {
          StandardTemplateNotification: {
            templateEmail: 'UploadedReleaseSLBTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail:
              'Aprobación | FP2P | Actualización de información de Pozo',
          },
          StandardNotifiedUsers: {
            users: ['adm-oloor@slb.com', 'OLoor@slb.com'], // Para no enviar correos usar --- users: [],
          },
        },
      ],
      2: [
        {
          StandardTemplateNotification: {
            templateEmail: 'UploadedReleaseSLBTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail:
              'Copia de Rechazo| FP2P | Actualización de información de Pozo',
          },
          StandardNotifiedUsers: {
            users: ['adm-oloor@slb.com', 'OLoor@slb.com'], // Para no enviar correos usar --- users: [],
          },
        },
        {
          StandardTemplateNotification: {
            templateEmail: 'UploadedReleaseSLBTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail:
              'Rechazo | FP2P | Actualización de información de Pozo',
          },
          StandardNotifiedUsers: {
            users: ['adm-oloor@slb.com', 'OLoor@slb.com'], // Para no enviar correos usar --- users: [],
          },
        },
      ],
      3: [
        {
          StandardTemplateNotification: {
            templateEmail: 'NotifyReleaseRunBesTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail: 'Liberacion RUNBES',
          },
          StandardNotifiedUsers: {
            //Usuarios de ALS BASE; para primera Firma
            users: ['KSaylema@slb.com', 'NOntaneda@als61.com'],
          },
        },
      ],
      4: [
        {
          StandardTemplateNotification: {
            templateEmail: 'NotifyRejectRelease',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail: 'Rechazo Release',
          },
          StandardNotifiedUsers: {
            users: [
              'EPilco@slb.com',
              'FMolina6@slb.com',
              'RLandazuri@slb.com',
              'JMorales91@slb.com',
            ], // Para no enviar correos usar --- users: [],
          },
        },
      ],
      5: [
        {
          StandardTemplateNotification: {
            templateEmail: 'NotifyReleaseRunBesTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail: 'Liberacion RUNBES',
          },
          StandardNotifiedUsers: {
            //Usuarios de CWI
            users: ['NOntaneda@slb.com', 'NOntaneda@cwi.com'],
          },
        },
      ],
      6: [
        {
          StandardTemplateNotification: {
            templateEmail: 'NotifyReleaseRunBesTemplate',
            templateSMS: null,
            templateTeams: 'releaseChangeState',
            subjectEmail: 'Liberacion RUNBES',
          },
          StandardNotifiedUsers: {
            //Usuarios de Lev Shaya
            users: ['NOntaneda@slb.com', 'NOntaneda@lev_shaya.com'],
          },
        },
      ],
    };

    const notifications =
      configNotificator[dataReceived.idStandardStates] !== undefined
        ? configNotificator[dataReceived.idStandardStates]
        : configNotificator[1];

    for (const notification of notifications) {
      //Envio el correo
      const mailListLogistica: string[] =
        notification.StandardNotifiedUsers.users;

      const emailInfo: any = {
        to: mailListLogistica,
        subject: notification.StandardTemplateNotification.subjectEmail,
      };

      officeMailer.sendEmail(
        notification.StandardTemplateNotification.templateEmail,
        dataReceived,
        emailInfo,
        token,
      );

      const usersTeams = notification.StandardNotifiedUsers.users;
      for (const user of usersTeams) {
        teamsChat.sendMessage(
          notification.StandardTemplateNotification.templateTeams,
          user,
          token,
          dataReceived,
        );
      }
    }

    return new Promise((resolve: any) => {
      setTimeout(() => {
        // Simulamos una respuesta exitosa después de 2 segundos
        resolve({ message: 'Mensajes enviados correctamente!' });
      }, 2000);
    });
  }
}
1;
