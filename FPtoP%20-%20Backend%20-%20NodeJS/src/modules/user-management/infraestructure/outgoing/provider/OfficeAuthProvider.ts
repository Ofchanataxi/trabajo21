import { Response, NextFunction } from 'express';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import GetRequiredEnvVar from '../../../../../shared/utils/GetRequiredEnVar';
import { UserService } from '../../../application/services/UserService';

class AuthProvider {
  private msalConfig: Configuration;
  private pca: ConfidentialClientApplication;

  constructor() {
    this.msalConfig = {
      auth: {
        clientId: GetRequiredEnvVar('OFFICE_365_CLIENT'),
        authority:
          'https://login.microsoftonline.com/' +
          GetRequiredEnvVar('OFFICE_365_TENANT_ID'),
        clientSecret: GetRequiredEnvVar('OFFICE_365_VALUE'),
      },
    };

    this.pca = new ConfidentialClientApplication(this.msalConfig);
  }

  public async login(res: Response, next: NextFunction): Promise<void> {
    const authCodeUrlParameters = {
      scopes: [
        'User.Read',
        'ChatMessage.Send',
        'Mail.Send',
        'profile',
        'Chat.ReadWrite',
      ],
      redirectUri: process.env.TOKEN_REDIRECT_URI || '',
    };

    try {
      const authUrl = await this.pca.getAuthCodeUrl(authCodeUrlParameters);
      res.json({ redirectTo: authUrl }); // el frontend hará el redirect manualmente
    } catch (error) {
      next(error); // manejar errores correctamente
    }
  }

  public async acquireToken(
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userService = new UserService();
      const code = req.query.code as string;
      if (!code) {
        return next(new Error('Authorization code not provided'));
      }
      const tokenRequest = {
        code,
        scopes: [
          'User.Read',
          'ChatMessage.Send',
          'Mail.Send',
          'profile',
          'Chat.ReadWrite',
        ],
        redirectUri: process.env.TOKEN_REDIRECT_URI || '',
        frontEndHomeRedirectUri: process.env.REDIRECT_URI || '',
        frontEndCreateUserRedirectUri:
          process.env.REDIRECT_URI_CREATE_USER || '',
        errorRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI || '',
      };

      const response = await this.pca.acquireTokenByCode(tokenRequest);

      const accessToken = response.accessToken;
      req.session.accessToken = accessToken;
      req.session.isAuthenticated = true;
      req.session.platform = 'fp2p';
      req.session.expiresOn = Math.floor(response.expiresOn!.getTime() / 1000);
      req.session.user = { id: 1, nombre: 'Oscar' };
      req.session.save(async (err: any) => {
        if (err) {
          console.error('Error al guardar sesión:', err);
          return res.status(500).send('Error al guardar sesión');
        }
        console.log('Sesión creada con ID:', req.sessionID);
        const isUserRegistered = await userService.isUserRegistered(
          req.session.accessToken,
        );
        if (isUserRegistered) {
          const dataUser = await userService.returnDataUser(
            req.session.accessToken,
          );
          const idUser = await userService.obtainIDByEmail(dataUser.email);
          res.redirect(
            tokenRequest.frontEndHomeRedirectUri,
          );
        } else {
          const dataUser = await userService.returnDataUser(
            req.session.accessToken,
          );
          res.redirect(
            tokenRequest.frontEndCreateUserRedirectUri +
            `/?firstName=${dataUser.firstName}&surName=${dataUser.surName}&email=${dataUser.email}&microsoftId=${dataUser.microsoftId}`,
          );
        }
      });
    } catch (error: any) {
      console.error('error en acquireTokenByCode');
      console.error(error);
      console.error(error.message);
    }
  }

  public async handleRedirect(
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const code = req.body.code as string;
    if (!code) {
      return next(new Error('Authorization code not provided'));
    }

    const tokenRequest = {
      code,
      scopes: ['User.Read'],
      redirectUri: process.env.REDIRECT_URI || '',
    };

    try {
      const response = await this.pca.acquireTokenByCode(tokenRequest);
      req.session.accessToken = response.accessToken;
      req.session.isAuthenticated = true;
      console.log('Encontre esto: ', req.session.accessToken);
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  }

  public logout(req: any, res: Response, next: NextFunction): void {
    req.session.destroy((err: any) => {
      if (err) {
        return next(err);
      }

      const logoutRedirectUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.POST_LOGOUT_REDIRECT_URI || '/')}`;

      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <title>Redirigiendo a logout de Microsoft...</title>
            <meta http-equiv="refresh" content="0; URL='${logoutRedirectUrl}'" />
          </head>
          <body>
            Cerrando sesión... Redirigiendo a <a href="${logoutRedirectUrl}">${logoutRedirectUrl}</a>
          </body>
        </html>
      `);
    });
  }
}

export default new AuthProvider();
