import { Request, Response, NextFunction } from 'express';
import { GetRequiredEnvVar } from '../../../../../config/environment';

const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.session || !req.session.accessToken) {
      console.log('No hay sesión activa o accessToken faltante');
      const loginRedirect = GetRequiredEnvVar('POST_LOGOUT_REDIRECT_URI');
      return res.redirect(loginRedirect);
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresOn = req.session.expiresOn;

    if (expiresOn && now >= expiresOn) {
      console.log('Sesión expirada');
      const loginRedirect = GetRequiredEnvVar('POST_LOGOUT_REDIRECT_URI');
      return res.redirect(loginRedirect);
    }

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(500).json({ message: 'Error interno de autenticación' });
  }
};

export default authMiddleware;