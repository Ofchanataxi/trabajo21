import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class VerifyStandardizationService {

  private apiUrl = environment.serverUrl + environment.endpoints.standardVerification.url;

  constructor(private http: HttpClient) { }
  // Método para obtener datos desde la API
  getData(elementsOfTheRelease: any, idBusinessLine: number): Observable<any> {
    const obj = {
      "idBusinessLine": idBusinessLine,
      "elements": elementsOfTheRelease,
    };
    return this.http.post(this.apiUrl, obj);
  }
}
