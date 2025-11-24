import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class QaqcServiceService {
  constructor(private http: HttpClient) {}

  // Pending Screen
  getPendingToCheck() {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.qaqc.pendingCheck.url;
    const urlName = environment.endpoints.qaqc.pendingCheck.name;
    const headers = new HttpHeaders({ "Url-Name": urlName });
    const params = {
      releaseStatus: environment.endpoints.qaqc.pendingCheck.query,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }

  getElementsRelease(releaseId: any) {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.qaqc.elementsByRelease.url;
    const urlName = environment.endpoints.qaqc.elementsByRelease.name;
    const headers = new HttpHeaders({ "Url-Name": urlName });
    const params = {
      releaseId: releaseId,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }
}
