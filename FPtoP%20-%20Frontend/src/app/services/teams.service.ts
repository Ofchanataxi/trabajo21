import { Injectable } from '@angular/core';
import { UserInfo } from '../features/auth/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private supportEmail: string = 'oloor@slb.com';

  constructor() {}

  openTeamsChat(user: UserInfo): void {
    if (!user || !user.email || !user.rol) {
      console.warn('Información del usuario incompleta. No se puede iniciar el chat.');
      return;
    }

    const currentUrl = window.location.href;  // Codificación segura de la URL

    const messageTeams = encodeURIComponent(
      `Hola, necesito asistencia.\n` +
      `🌐 URL actual: ${currentUrl}\n` +
      `📧 Correo: ${user.email}\n` +
      `🏢 Segmento: ${user.nameBusinessLine}\n` +
      `👤 Rol: ${user.rol}\n\n` +
      `Asunto: `
    );

    const urlTeams = `https://teams.microsoft.com/l/chat/0/0?users=${this.supportEmail}&message=${messageTeams}`;

    try {
      window.open(urlTeams, '_blank'); // Abrir en una nueva pestaña
    } catch (error) {
      console.error('Error al abrir el chat de Teams:', error);
    }
  }
}
