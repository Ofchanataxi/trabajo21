import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest
} from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable, map } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ObtainElementsOfSheetService {

  private apiUrl = environment.serverUrl + environment.endpoints.obtainElementsOfSheet.url;
  
  constructor(private http: HttpClient) { }

  sendData(element: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("file", element.file);
    formData.append('sheetSelected', element.sheetSelected);
    const req = new HttpRequest("POST", this.apiUrl, formData, {
      reportProgress: true,
    });
    
    return this.http.request(req).pipe(map((event) => this.getEventMessage(event, element.file)));
  }
  private getEventMessage(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return {
          status: "progress",
          file,
          progress: Math.round(100 * (event.loaded / event.total!)),
        };
      case HttpEventType.Response:
        return { status: "complete", file, response: event.body };
      default:
        return `Unhandled event: ${event.type}`;
    }
  }
}
