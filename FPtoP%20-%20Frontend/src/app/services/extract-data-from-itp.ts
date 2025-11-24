import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExtractionService {
  // Asegúrate que esta ruta en tus environments apunte a: .../api/v1/extract-data
  private apiUrl = environment.pythonServer + environment.endpoints.extractDataFromITP.url;

  constructor(private http: HttpClient) {}

  /**
   * Envía archivos al microservicio de Python para extracción.
   * @param file El archivo principal (Tally Sheet o ITP).
   * @param releaseType El ID del tipo de liberación (7 para cruce Tally-MTC).
   * @param mtcFiles Lista opcional de archivos MTC (solo para Tally Tenaris).
   */
  extractData(file: File, releaseType: number, mtcFiles: File[] = []): Observable<any> {
    const formData = new FormData();

    formData.append('file', file, file.name);
    formData.append('release_type', releaseType.toString());

    if (mtcFiles && mtcFiles.length > 0) {
      mtcFiles.forEach(mtc => {
        formData.append('mtc_files', mtc, mtc.name);
      });
    }

    return this.http.post(this.apiUrl, formData);
  }
}
