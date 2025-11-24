import { Request, Response, NextFunction } from 'express';
import officeAuthProvider from '../../outgoing/provider/OfficeAuthProvider';
import jwtAuthProvider from '../../outgoing/provider/JwtAuthProvider';

class AuthService {
  public signin(
    authType: string,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (authType === 'office365') {
      officeAuthProvider.login(res, next);
    } else if (authType === 'jwt') {
      jwtAuthProvider.login(req, res, next);
    } else {
      res.status(400).json({ message: 'Invalid auth type' });
    }
  }

  public acquireToken(req: Request, res: Response, next: NextFunction): void {
    const { authType } = req.query;
    officeAuthProvider.acquireToken(req, res, next);
    // if (authType === 'office365') {
    //   officeAuthProvider.acquireToken(req, res, next);
    // } else if (authType === 'jwt') {
    //   jwtAuthProvider.acquireToken(req, res, next);
    // } else {
    //   res.status(400).json({ message: 'Invalid auth type' });
    // }
  }

  public handleRedirect(req: Request, res: Response, next: NextFunction): void {
    const { authType } = req.query;

    if (authType === 'office365') {
      officeAuthProvider.handleRedirect(req, res, next);
    } else if (authType === 'jwt') {
      jwtAuthProvider.handleRedirect(req, res, next);
    } else {
      res.status(400).json({ message: 'Invalid auth type' });
    }
  }

  public signout(req: Request, res: Response, next: NextFunction): void {
    const { authType } = req.query;

    if (authType === 'office365' || authType === undefined) {
      officeAuthProvider.logout(req, res, next);
    } else if (authType === 'jwt') {
      jwtAuthProvider.logout(req, res, next);
    } else {
      res.status(400).json({ message: 'Invalid auth type' });
    }
  }
}

export default new AuthService();
