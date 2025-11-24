import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class ObtainSheetsService {
  private apiUrl = environment.serverUrl + environment.endpoints.obtainSheets.url;
  
  constructor(private http: HttpClient) { }
  getData(file: File): Observable<any> {
    console.log("getData ObtainSheetsService");
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.apiUrl, formData);
  }
}

