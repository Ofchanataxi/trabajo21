import { EnvironmentInjector, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WellInformationService {
  private apiUrl = environment.serverUrl + environment.endpoints.getFieldWellInformation.url;

  constructor(private http: HttpClient) {}

  getWellInformation(idOilFielOperations: string | null): Observable<any[]> {
    console.log('myurl', this.apiUrl);
    const bodyData = {
      baseTableName: 'OilfieldOperations',
      idOilFielOperations: idOilFielOperations,
    };
    return this.http.post<any[]>(this.apiUrl, bodyData);
  }

  getwellReports(idOilFielOperations: string | null): Observable<any[]> {
    console.log('myurl', environment.serverUrl+'field/well-reports');
    const bodyData = {
      baseTableName: 'OilfieldOperations',
      idOilFielOperations: idOilFielOperations,
    };
    return this.http.post<any[]>(environment.serverUrl+'field/well-reports', bodyData);
  }

  postAcceptedWellInformation(wellInformation: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Url-Name': environment.approvementWellsEndpoints.acceptWellInformation.name,
    });

    return this.http.post(
      environment.apiBaseUrl + environment.approvementWellsEndpoints.acceptWellInformation.url,
      wellInformation,
      { headers: headers }
    );
  }

  postRejectedWellInformation(wellInformation: any): Observable<any> {
    console.log('postRejectedWellInformation');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Url-Name': environment.approvementWellsEndpoints.rejectWellInformation.name,
    });

    return this.http.post(
      environment.apiBaseUrl + environment.approvementWellsEndpoints.rejectWellInformation.url,
      wellInformation,
      { headers: headers }
    );
  }
}
