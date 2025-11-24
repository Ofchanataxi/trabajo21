import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReleaseService {
  constructor(private http: HttpClient) {}

  getReleaseData(idRelease: any): Observable<any> {
    const apiUrl =
      environment.serverUrl + environment.endpoints.releaseManagement.obtainReleaseData.url;

    return this.http.post(apiUrl, {
      idRelease: idRelease,
    });
  }

  getReleaseHistory(idRelease: any): Observable<any> {
    const apiUrl =
      environment.serverUrl + environment.endpoints.releaseManagement.obtainReleaseHistory.url;

    return this.http.post(apiUrl, {
      idRelease: idRelease,
    });
  }
  getDocumentsOfRelease(apiUrl: string, urlName: string, idRelease: number) {
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    return this.http.get<any>(apiUrl, {
      headers,
      params: { idRelease: idRelease },
    });
  }
  getDocumentsOfReleaseToReturn(apiUrl: string, urlName: string, idRelease: number) {
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    return this.http.get<any>(apiUrl, {
      headers,
      params: { idRelease: idRelease },
    });
  }
  getDocumentsOfReleaseToDetained(apiUrl: string, urlName: string, idRelease: number) {
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    return this.http.get<any>(apiUrl, {
      headers,
      params: { idRelease: idRelease },
    });
  }
  getReleases(apiUrl: string, urlName: string, params: { idOilfieldOperations: number }) {
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    return this.http.get<any>(apiUrl, {
      headers,
      params,
    });
  }
  getStandardCondition() {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.releaseManagement.getStandardCondition.url;
    const urlName =
      environment.apiBaseUrl + environment.endpoints.releaseManagement.getStandardCondition.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.get<any>(apiUrl, { headers });
  }
}
