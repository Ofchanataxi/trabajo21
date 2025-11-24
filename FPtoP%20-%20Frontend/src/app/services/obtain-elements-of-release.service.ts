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
export class ObtainElementsOfReleaseService {

  private apiUrl = environment.serverUrl + environment.endpoints.obtainElementsOfRelease.url;
  
  constructor(private http: HttpClient) { }
  
  getElements(idRelease: any): Observable<any> {
    return this.http.post(this.apiUrl, {
        "idRelease": idRelease,
    });
  }
}
