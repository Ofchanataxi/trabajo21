import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pdf-viewer-dialog',
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrls: ['./pdf-viewer-dialog.component.scss'],
})
export class PdfViewerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PdfViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string, title:string }
  ) { }


  onNoClick(): void {
    this.dialogRef.close();
  }

  zoom = 1.0;  // Escala inicial

  zoomIn() {
    this.zoom += 0.2;
    
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom - 0.2, 0.5); // Zoom mínimo de 0.5x
    
  }
  resetZoom() {
    this.zoom = 1; // Zoom mínimo de 0.5x
  } 

}
