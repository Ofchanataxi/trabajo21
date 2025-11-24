import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class SigningService {
  private apiUrl = environment.javaServer + environment.endpoints.signing.url;
  constructor(private http: HttpClient) { }

  signPdf(
    file: File,
    certificate: File,
    certificatePassword: string,
    sign: string
  ): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('certificate', certificate);
    formData.append('certificatePassword', certificatePassword);
    formData.append('sign', sign);

    const headers = new HttpHeaders();

    // Establece la opción `responseType` como `blob` para manejar archivos binarios
    return this.http.post(this.apiUrl, formData, {
      headers,
      responseType: 'blob',
    });
  }


  checkSign(file: File){
    const apiUrl =
    environment.apiBaseUrl +
    environment.endpoints.checkSign.url;
    const urlName = environment.endpoints.notifications.release.send.name;

    const formData: FormData = new FormData();
    formData.append("file", file);

  return this.http.post<any>(apiUrl, formData);

  }
}
