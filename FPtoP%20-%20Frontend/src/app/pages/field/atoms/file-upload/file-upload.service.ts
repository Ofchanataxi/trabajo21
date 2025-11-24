import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private apiUrl = environment.serverUrl+ environment.endpoints.uploadFileOpenwells.url; 
  

  constructor(private http: HttpClient) {}

  uploadFile(file: File, idOilFielOperations:any, modifiedby: any): Observable<any> {
    console.log('uploadFile', modifiedby)
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('idOilFielOperations', idOilFielOperations); 
    formData.append('modifiedby', modifiedby); 
    
 console.log('uploadFile', formData)
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
 