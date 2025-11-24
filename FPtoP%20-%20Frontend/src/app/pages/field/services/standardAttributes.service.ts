import { EnvironmentInjector, Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class StandardAttributesService {
  private apiUrl = environment.serverUrl;
  
  constructor(private http: HttpClient) {}

  getStandardAttributes(tableName: string): Observable<any[]> {
    
    console.log('Request URL:', this.apiUrl + "field/" + tableName);

    return this.http.get<any[]>(this.apiUrl + "field/" + tableName);
  }
}
