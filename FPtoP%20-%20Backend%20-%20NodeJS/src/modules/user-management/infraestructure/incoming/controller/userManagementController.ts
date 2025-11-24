// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import { UserManagementService } from '../services/userManagementServices';
import { UserService } from '../../../application/services/UserService';

export class UserManagementController {
  private readonly userManagementService = new UserManagementService();
  private readonly userService = new UserService();

   /**
   * Helper: obtiene el id del usuario autenticado a partir del accessToken en sesión.
   * Lanza errores con códigos adecuados si falta token o no se puede resolver el usuario.
   */
  private async getAuthenticatedUserId(req: any): Promise<number> {
    if (!req.session?.accessToken) {
      const err: any = new Error('No autenticado');
      err.status = 401;
      throw err;
    }
    const graphUser = await this.userService.returnDataUser(req.session.accessToken);
    if (!graphUser?.email) {
      const err: any = new Error('No se pudo obtener el email del usuario desde el token');
      err.status = 401;
      throw err;
    }
    const idUser = await this.userService.obtainIDByEmail(graphUser.email);
    if (!idUser) {
      const err: any = new Error('Usuario no registrado');
      err.status = 404;
      throw err;
    }
    return idUser;
  }

  public async create(req: Request, res: Response) {
    try {
      const idBusinessLine: number = parseInt(req.body.idBusinessLine, 10) || 0;
      const email: string = req.body.email || '';
      const firstName: string = req.body.firstName || '';
      const lastName: string = req.body.lastName || '';
      const microsoftid: string = req.body.microsoftid || '';

      const response = await this.userManagementService.create(
        idBusinessLine,
        email,
        firstName,
        lastName,
        microsoftid,
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getByID(req: Request, res: Response) {
    try {
      const idUser: number = parseInt(req.body.idUser, 10) || 0;

      if (idUser === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      const response = await this.userManagementService.getByID(idUser);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

    public async getCurrentUserSession(req: Request, res: Response) {
    try {
      const idFromToken = await this.getAuthenticatedUserId(req);
      const response = await this.userManagementService.getByID(idFromToken);
      return res.json(response);
    } catch (error: any) {
      console.log(error);
      const status = error?.status ?? 500;
      return res.status(status).json({ message: error.message });
    }
  }
}



