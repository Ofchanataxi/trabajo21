import { HttpClient } from "@angular/common/http";
import { Injectable, Input } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  @Input() dataUrl: string;

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>(this.dataUrl);
  }

  getAttrElementRules(apiUrl: string): Observable<any> {
    return this.http.get<any>(this.dataUrl);
  }

  
}
