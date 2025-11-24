import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UploadZipFileServiceService {
  private uploadZipUrl =
    environment.serverUrl + environment.endpoints.uploadZip.url;

  constructor(private http: HttpClient) {}

  uploadZip(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("file", file);
    const req = new HttpRequest("POST", this.uploadZipUrl, formData, {
      reportProgress: true,
    });

    return this.http
      .request(req)
      .pipe(map((event) => this.getEventMessage(event, file)));
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
