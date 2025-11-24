import { EnvironmentInjector, Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class StandardElementsOptionsService {
  private apiUrl = environment.serverUrl;
  
  constructor(private http: HttpClient) {}

  getStandardElementsOptions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "field/EquipmentsOptions");
  }
}
