import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'test-app-button-upload',
  templateUrl: './button-upload.component.html',
  styleUrls: ['./button-upload.component.css'],
})
export class TestButtonUploadComponent {
  urlToSave =
    environment.serverUrl + environment.endpoints.fileManagement.fileUploadToOilfieldOperation.url;
  urlToDelete = `${environment.serverUrl}${environment.endpoints.fileManagement.dropFileOfOilfieldOperation.url}`;
}

// // Para OilfieldOperation
// urlToSave =
//   environment.serverUrl + environment.endpoints.fileManagement.fileUploadToOilfieldOperation.url;
// urlToDelete = `${environment.serverUrl}${environment.endpoints.fileManagement.dropFileOfOilfieldOperation.url}`;

// // Para ElementRelease
// urlToSave = environment.serverUrl + environment.endpoints.fileUploaToElementdRelease.url;
// urlToDelete = `${environment.serverUrl}${environment.endpoints.fileManagement.dropFileOfElementRelease.url}`;

// // Para Release
// urlToSave = environment.serverUrl + environment.endpoints.fileUploadToRelease.url;
// urlToDelete = `${environment.serverUrl}${environment.endpoints.fileManagement.dropFileOfRelease.url}`;
