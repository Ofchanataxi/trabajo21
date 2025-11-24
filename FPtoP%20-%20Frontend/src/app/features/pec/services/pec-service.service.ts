import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PecServiceService {
  constructor(private http: HttpClient) {}

  // Pending Screen
  getPendingToCheck() {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.pec.pendingCheck.url;
    const urlName = environment.endpoints.pec.pendingCheck.name;
    const headers = new HttpHeaders({ "Url-Name": urlName });
    const params = {
      releaseStatus: environment.endpoints.pec.pendingCheck.query,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }

  getElementsRelease(releaseId: any) {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.pec.elementsByRelease.url;
    const urlName = environment.endpoints.pec.elementsByRelease.name;
    const headers = new HttpHeaders({ "Url-Name": urlName });
    const params = {
      releaseId: releaseId,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }
}
