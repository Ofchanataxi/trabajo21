import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ElementRelease } from 'src/app/core/interfaces/elementRelease.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticService {
  public obj: any;
  constructor(private http: HttpClient) {}

  getPendingToCheck() {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.segment.pendingReleases.url;
    const urlName = environment.endpoints.segment.pendingReleases.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      segmentId: environment.query.segment.ids.Logistic,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }

  getDraftsToCheck() {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.segment.draftReleases.url;
    const urlName = environment.endpoints.segment.draftReleases.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      segmentId: environment.query.segment.ids.Logistic,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }

  getMetaDataReleasesByState(idReleaseState: number, idBusinessLine: null | number = null) {
    const apiUrl =
      environment.apiBaseUrl +
      environment.endpoints.releaseManagement.getMetaDataReleasesByState.url;
    const urlName =
      environment.apiBaseUrl +
      environment.endpoints.releaseManagement.getMetaDataReleasesByState.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      idReleaseState: idReleaseState,
      idBusinessLine: idBusinessLine,
    };

    return this.http.post<any>(apiUrl, params, {
      headers,
      withCredentials: true,
    });
  }

  getMetaDataActiveWells() {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.releaseManagement.getMetaDataActiveWells.url;
    const urlName =
      environment.apiBaseUrl + environment.endpoints.releaseManagement.getMetaDataActiveWells.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.get<any>(apiUrl);
  }

  getApprovedToCheck() {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.segment.approvedReleases.url;
    const urlName = environment.endpoints.segment.approvedReleases.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      segmentId: environment.query.segment.ids.Logistic,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }

  getRejectedToCheck() {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.segment.rejectedReleases.url;
    const urlName = environment.endpoints.segment.rejectedReleases.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      segmentId: environment.query.segment.ids.Logistic,
    };
    return this.http.get<any>(apiUrl, { headers, params });
  }

  postSaveWellUploadedData(obj: object) {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.logistic.uploadWellData.url;
    const urlName = environment.endpoints.logistic.uploadWellData.name;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.post<any>(apiUrl, obj, { headers });
  }

  postNewAttributeElement(obj: Object) {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.logistic.postNewAttributeElement.url;
    const urlName = environment.endpoints.logistic.postNewAttributeElement.name;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.post<any>(apiUrl, obj, { headers });
  }

  postNewAttributeList(obj: Object) {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.logistic.postNewAttributeList.url;
    const urlName = environment.endpoints.logistic.postNewAttributeList.name;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.post<any>(apiUrl, obj, { headers });
  }

  postNewStandardElementError(obj: Object) {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.logistic.postNewStandardElementError.url;
    const urlName = environment.endpoints.logistic.postNewStandardElementError.name;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.post<any>(apiUrl, obj, { headers });
  }

  postNewElement(newElement: Object): Observable<Object> {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.logistic.uploadNewElement.url;
    const urlName = environment.endpoints.logistic.uploadNewElement.name;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.post<any>(apiUrl, newElement, { headers });
  }

  postNewErrorExtensionDocuments(obj: Object) {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.logistic.postNewErrorExtensionDocuments.url;
    const urlName = environment.endpoints.logistic.postNewErrorExtensionDocuments.name;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.post<any>(apiUrl, obj, { headers });
  }
}
