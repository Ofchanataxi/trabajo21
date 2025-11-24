import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class CreateReleaseWithOilfieldDataService {

  private apiUrl = environment.serverUrl + environment.endpoints.createNewRelease.url;

  constructor(private http: HttpClient) { }
  // Método para obtener datos desde la API
  saveData(wellName: string, oilfieldTypeOperations: string, woNumber: number, worig: string, longWellName:string, jobStartDate:string, jobEndDate:string, idBusinessLine:number, idUser:number): Observable<any> {
    let data = {
        wellName,
        oilfieldTypeOperations,
        woNumber,
        worig,
        longWellName,
        jobStartDate,
        jobEndDate,
        idBusinessLine,
        idUser,
    }
    return this.http.post(this.apiUrl, data);
  }
}
