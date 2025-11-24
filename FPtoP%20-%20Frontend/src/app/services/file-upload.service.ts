import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File, data: Record<string, any>, url: string): Observable<any> {
    const formData: FormData = new FormData();

    formData.append('file', file);
    // Recorrer las claves del objeto `data` y añadirlas al FormData
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    const headers = new HttpHeaders({
      'Url-Name': environment.endpoints.uploadDocuments.name,
    });

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      headers,
    });

    return this.http.request(req).pipe(map(event => this.getEventMessage(event, file)));
  }

  verifyFile(file: File): Observable<any> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const urlToSend = {
      name: environment.endpoints.fileManagement.verifySign.name,
      path: `${environment.serverUrl}${environment.endpoints.fileManagement.verifySign.url}`,
    };

    const headers = new HttpHeaders({
      'Url-Name': urlToSend.name,
    });

    const req = new HttpRequest('POST', urlToSend.path, formData, {
      reportProgress: true,
      headers,
    });

    return this.http.request(req).pipe(map(event => this.getEventMessage(event, file)));

    // console.log('VerifyFile');
    // const formData: FormData = new FormData();

    // formData.append('file', file);
    // console.log(formData);
    // // Recorrer las claves del objeto `data` y añadirlas al FormData

    // console.log(formData);
    // const urlToSend = {
    //   name: environment.endpoints.fileManagement.verifySign.name,
    //   path: `${environment.serverUrl}${environment.endpoints.fileManagement.verifySign.url}`,
    // };

    // console.log(urlToSend);

    // const response = await this.http.post(urlToSend.path, formData).subscribe({
    //   next: res => console.log('✅ Subido con éxito', res),
    //   error: err => console.error('❌ Error al subir', err),
    // });

    // return response;
    // try {
    //   const response = await
    //   console.log('response');
    //   console.log(response);
    //   return response;
    // } catch (error) {
    //   console.error(error);
    //   return true;
    // }

    //return this.http.request(req).pipe(map(event => this.getEventMessage(event, file)));
  }

  dropFile(data: Record<string, any>, url: string): Observable<any> {
    return this.http.post(url, data);
  }

  private getEventMessage(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return {
          status: 'progress',
          file,
          progress: Math.round(100 * (event.loaded / event.total!)),
        };
      case HttpEventType.Response:
        return { status: 'complete', file, response: event.body };
      default:
        return `Unhandled event: ${event.type}`;
    }
  }

  private getBurntEventMessage(file: File, event: any) {
    return { status: 'complete', file, response: event.body };
  }
}
