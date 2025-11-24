import axios from 'axios';
import { obtainTemplate } from './Templates/templates';

export class TeamsChatService {
  // private
  // constructor() {
  //   this.emailClient = EmailClientFactory.createClient();
  // }

  private createChatTeams = async (
    accessToken: string,
    idUser: any,
    correoReceptor: any,
  ) => {
    const url = 'https://graph.microsoft.com/v1.0/chats';

    // Identificador del usuario al que quieres enviar el mensaje (puedes obtenerlo de la API de Microsoft Graph)
    const userId = idUser;

    const data = {
      chatType: 'oneOnOne',
      members: [
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind':
            "https://graph.microsoft.com/v1.0/users('" + idUser + "')",
        },
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind':
            "https://graph.microsoft.com/v1.0/users('" + correoReceptor + "')",
        },
      ],
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, data, { headers });
      //console.log('Canal de mensajes creado!', response.data);
      return response.data.id;
    } catch (error: any) {
      console.error('Failed to crear message');
      console.error(error.response);
      console.error('Failed to crear message', error.response.data);
    }
  };

  private getUserInfo = async (accessToken: any) => {
    const url = 'https://graph.microsoft.com/v1.0/me';

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get(url, { headers });
      //console.log('User ID:', response.data.id);
      return response.data.id;
    } catch (error: unknown) {
      console.error('Failed to get user info', error);
    }
  };

  private sendMessageToChat = async (
    accessToken: any,
    chatId: any,
    nameTemplate: string,
    dataToSend: any,
  ) => {
    const url = `https://graph.microsoft.com/v1.0/me/chats/${chatId}/messages`;

    const token = accessToken; // Función para obtener el token de acceso

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const body = obtainTemplate(nameTemplate, dataToSend);

    try {
      const response = await axios.post(url, body, { headers });
      // console.log('Mensaje enviado con éxito:', response.data);
    } catch (error: any) {
      console.error('Error al enviar el mensaje:', error.response.data);
    }
  };

  public sendMessage = async (
    nameTemplate: string,
    correoReceptor: string,
    accessToken: string,
    dataToSend: any,
  ) => {
    const idUser = await this.getUserInfo(accessToken);
    const idChat = await this.createChatTeams(
      accessToken,
      idUser,
      correoReceptor,
    );
    await this.sendMessageToChat(accessToken, idChat, nameTemplate, dataToSend);
  };
}
