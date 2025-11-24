import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class WellElementsService {
  
  private apiUrl = environment.serverUrl+ environment.endpoints.getFieldWellElements.url;
  private apiUpdateUrl = environment.serverUrl+ environment.endpoints.updateRows.url;
  private apiUpdateInfoUrl = environment.serverUrl+ "field/lastUpdateInfo";
  private apiReports = environment.serverUrl+ "field/well-reports";

  constructor(private http: HttpClient) {}
  
  getWellElements(idOilFielOperations:string | null): Observable<any[]> {
  
    console.log('myurl',this.apiUrl)
    const bodyData = {
      "baseTableName": "OilfieldOperations",
      "idOilFielOperations":idOilFielOperations,
  }
    return this.http.post<any[]>(this.apiUrl,bodyData);
  }

  getReports(idOilFielOperations:string | null): Observable<any[]> {
  
    console.log('myurl',this.apiReports)
    const bodyData = {
      "idOilFielOperations":idOilFielOperations,
  }
    return this.http.post<any[]>(this.apiReports,bodyData);
  }

  getTallyElements(idOilFielOperations:string | null): Observable<any[]> {
  
    
    console.log('myurl',environment.serverUrl+ environment.endpoints.getTallyElements.url)
    const bodyData = {
      "baseTableName": "OilfieldOperations",
      "idOilFielOperations":idOilFielOperations,
  }
    return this.http.post<any[]>(environment.serverUrl+ environment.endpoints.getTallyElements.url,bodyData);
  }

  
  getUpdateInfo(idOilFielOperations:string | null): Observable<any[]> {
  
    console.log('myurl',this.apiUpdateInfoUrl)
    const bodyData = {
      "idOilFielOperations":idOilFielOperations,
  }
    return this.http.post<any[]>(this.apiUpdateInfoUrl,bodyData);
  }
  updateRows(idOilFielOperations:string | null,updatedRows: any[], user : string | null): Observable<any> {
    console.log('Sending updated rows to backend:', updatedRows, this.apiUpdateUrl);

    const bodyData = {
      baseTableName: 'OilfieldOperations',
      "idOilFielOperations":idOilFielOperations,
      user : user, 
      rows: updatedRows,
    };

    

    return this.http.post<any>(this.apiUpdateUrl, bodyData);
  }

  updateFields(updatedFields: any[], user: string | null): Observable<any> {
    const bodyData = {
      rows: updatedFields,
      user: user,
    };
    console.log("rows sendt to back", updatedFields)
    return this.http.post(`${environment.serverUrl}field/updateFields`, bodyData);
  }

  deleteByIdOilfieldOperations(idOilfieldOperations: string): Observable<any> {
    const bodyData = {
      "idOilfielOperations":idOilfieldOperations,
    };
    console.log("request to delete send to back")
    return this.http.post(`${environment.serverUrl}field/deletebyIdOilfieldOperation`, bodyData);
  }
}