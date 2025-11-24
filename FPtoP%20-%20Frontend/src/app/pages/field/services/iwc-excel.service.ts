import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IwcExcelService {
  constructor(private http: HttpClient) {}

  // Download Excel IWC
  downloadIwcExcel(tallyId: string): Observable<Blob> {
    return this.http.get(`${environment.serverUrl}api/iwc/download/${tallyId}`, {
      responseType: 'blob',
    });
  }

  // Cargar template IWC
  updateTallyLengths(payload: {
    idElementTally: number[];
    length: (number | null)[];
  }): Observable<{ updated: number; errors: any[] }> {
    return this.http.post<{ updated: number; errors: any[] }>(
      `${environment.serverUrl}api/iwc/bulk-update-tally-lengths`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
