import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getExcelCPI(idOilFielOperations: string | null): Observable<HttpResponse<Blob>> {
    const bodyData = {
      baseTableName: 'OilfieldOperations',
      idOilFielOperations
    };

    const request = this.http.post(
      `${environment.serverUrl}field/sumarioCPI`,
      bodyData,
      {
        responseType: 'json'
      }
    ) as unknown as Observable<HttpResponse<Blob>>; 

    return request;
  }
  getExcelWO(idOilFielOperations: string | null): Observable<HttpResponse<Blob>> {
    const bodyData = {
      baseTableName: 'OilfieldOperations',
      idOilFielOperations
    };

    const request = this.http.post(
      `${environment.serverUrl}field/sumarioWO`,
      bodyData,
      {
        responseType: 'json'
      }
    ) as unknown as Observable<HttpResponse<Blob>>; 

    return request;
  }

  getExcelTally(idOilFielOperations: string | null): Observable<HttpResponse<Blob>> {
    const bodyData = {
      baseTableName: 'OilfieldOperations',
      idOilFielOperations
    };

    const request = this.http.post(
      `${environment.serverUrl}field/tally`,
      bodyData,
      {
        responseType: 'json'
      }
    ) as unknown as Observable<HttpResponse<Blob>>; 

    return request;
  }


  getExcelDH(idOilFielOperations: string | null, cpiwotype: string): Observable<HttpResponse<Blob>> {
    const bodyData = {
      baseTableName: 'OilfieldOperations',
      idOilFielOperations,
      cpiwotype,
    };

    const request = this.http.post(
      `${environment.serverUrl}field/dh`,
      bodyData,
      {
        responseType: 'json'
      }
    ) as unknown as Observable<HttpResponse<Blob>>; 

    return request;
  }
}
