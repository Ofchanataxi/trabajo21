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
export class DeleteReleaseInformationService {

  private apiUrl = environment.serverUrl + environment.endpoints.deleteReleaseData.url;
  
  constructor(private http: HttpClient) { }
  
  deleteElements(idRelease: any): Observable<any> {
    return this.http.delete(this.apiUrl, {
        body: { idRelease: idRelease },
    });
  }
}