import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusinessLineService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.businessLine.getAll.url;
    console.log('Voy a llamar a');
    console.log(apiUrl);
    return this.http.get(apiUrl);
  }

  updateBusinessLine(data: any): Observable<any> {
    const apiUrl =
      environment.serverUrl + environment.endpoints.businessLine.updateBusinessLine.url;
    const obj = {
      idBusinessLine: data.idBusinessLine,
      idUser: data.idUser,
    };
    return this.http.post(apiUrl, obj);
  }
}
