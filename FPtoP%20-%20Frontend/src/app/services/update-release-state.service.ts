import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateReleaseStateService {
  private apiUrl = environment.serverUrl + environment.endpoints.updateReleaseStateService.url;

  constructor(private http: HttpClient) {}

  update(
    idReleaseState: number,
    idRelease: number,
    idCreatedBy: number,
    changeReason: string = ''
  ): Observable<any> {
    return this.http.post(this.apiUrl, {
      idReleaseState: idReleaseState,
      idRelease: idRelease,
      idCreatedBy: idCreatedBy,
      changeReason: changeReason,
    });
  }
}
