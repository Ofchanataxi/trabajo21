import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../features/auth/auth.service';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class GetDocumentsOfElementService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  // Método para obtener datos desde la API
  getData(element: any): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.getDocumentsofElement.url;
    return this.http.post(apiUrl, element);
  }

  getFileFromPath(filePath: string, idStoredFiles: number, fileName: string): Observable<Blob> {
    const body = { filePath, idStoredFiles, fileName };
    const token = this.authService.getToken(); // Obtener el token de autenticación

    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    const apiUrl = environment.serverUrl + environment.endpoints.obtainFile.url;
    return this.http.post(apiUrl, body, { headers, responseType: 'blob' });
  }

  async getFileFromPathAxios(
    filePath: string,
    idStoredFiles: number,
    fileName: string
  ): Promise<Blob> {
    const body = { filePath, idStoredFiles, fileName }; // El cuerpo de la solicitud
    const token = this.authService.getToken();

    // Crear la configuración con los encabezados
    const config = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      responseType: 'blob' as const,
    };

    try {
      const apiUrl = environment.serverUrl + environment.endpoints.obtainFile.url;
      const response = await axios.post(apiUrl, body, config);

      return response.data; // Regresar el Blob obtenido
    } catch (error) {
      console.error('Error al obtener el archivo:', error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  }
}
