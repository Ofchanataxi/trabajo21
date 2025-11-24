import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { GetPagesAccess } from '../../../application/use-cases/GetPagesAccess';
import { SequelizeUserRepository } from '../Database/Repositories/SequelizeUserRepository';

class AuthController {
  constructor(private getPagesAccess: GetPagesAccess) {}

  public signin(req: any, res: Response, next: NextFunction): void {
    const authType: string =
      req.query.authType !== undefined ? req.query.authType : '';
    authService.signin(authType, req, res, next);
  }

  public acquireToken(req: Request, res: Response, next: NextFunction): void {
    authService.acquireToken(req, res, next);
  }

  public handleRedirect(req: Request, res: Response, next: NextFunction): void {
    console.log('Entre al handleRedirect');
    authService.handleRedirect(req, res, next);
  }

  public signout(req: Request, res: Response, next: NextFunction): void {
    authService.signout(req, res, next);
  }

  public status(req: any, res: Response, _next: NextFunction): void {
    if (req.session.isAuthenticated) {
      res.json(true);
    } else {
      res.json(false);
    }
  }

  async userData(req: any, res: Response, next: NextFunction) {
    try {
      const userData = await this.getPagesAccess.execute(req, res, next);
      res.json(userData);
    } catch (error) {
      res.status(500);
      res.json({ error });
    }
  }
}

export default new AuthController(
  new GetPagesAccess(new SequelizeUserRepository()),
);
