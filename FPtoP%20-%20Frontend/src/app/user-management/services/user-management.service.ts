import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.userManagement.create.url;
    const obj = {
      idBusinessLine: data.idBusinessLine,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      microsoftid: data.microsoftid,
    };
    return this.http.post(apiUrl, obj);
  }

  getByID(data: any): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.userManagement.getByID.url;
    const obj = {
      idUser: data.idUser,
    };
    return this.http.post(apiUrl, obj);
  }

    getCurrentUserSession(): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.userManagement.getCurrentUserSession.url;
    return this.http.get(apiUrl, {withCredentials: true});
  }
}
