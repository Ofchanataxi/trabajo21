import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface BusinessLineDto {
  idStandardBusinessLines: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class RolesBusinessLineService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<{ data: BusinessLineDto[] }> {
    const apiUrl = environment.serverUrl + environment.endpoints.rolesBusinessLine.getAll.url;

    console.log('Voy a llamar a');
    console.log(apiUrl);
    return this.http.get<any>(apiUrl).pipe(
      map(res => (Array.isArray(res) ? { data: res } : res?.data ? res : { data: [] })),
      catchError(err => of({ data: [] }))
    );
  }
}
