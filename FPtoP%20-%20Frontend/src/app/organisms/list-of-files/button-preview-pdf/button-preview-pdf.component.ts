import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerDialogComponent } from '../../pdf-viewer-dialog/pdf-viewer-dialog.component';

@Component({
  selector: 'app-button-preview-pdf',
  templateUrl: './button-preview-pdf.component.html',
  styleUrls: ['./button-preview-pdf.component.css'],
})
export class ButtonPreviewPDFComponent {
  @Input() file: File;
  @Input() path: string | null; 

  constructor(public dialog: MatDialog) {}

  showPreview(event: MouseEvent) {
    
    event.stopPropagation();

    const urlParaElVisor = this.path ? this.path : URL.createObjectURL(this.file);

    const dialogRef = this.dialog.open(PdfViewerDialogComponent, {
      width: '80%',
      height: '80%',
      data: { url: urlParaElVisor, title: this.file.name },
    });

    dialogRef.afterClosed().subscribe(() => {
      if (!this.path) {
        URL.revokeObjectURL(urlParaElVisor);
      }
    });
  }
}
