import { Component, Input } from '@angular/core';
import { GetDocumentsOfElementService } from 'src/app/services/get-documents-of-element.service';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import JSZip from 'jszip';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DownloadFoldersComponent } from 'src/app/shared/components/templates/download-folders/download-folders.component';

@Component({
  selector: 'shared-button-download-zip',
  templateUrl: './button-download-zip.component.html',
  styleUrls: ['./button-download-zip.component.scss'],
})
export class DownloadZipComponent {
  constructor(
    private getDocumentsOfElementService: GetDocumentsOfElementService,
    private messageService: MessageService,
    public dialog: MatDialog
  ) {}

  @Input() folder: any;
  @Input() documentsElement: any;
  @Input() label: string = 'DESCARGAR';

  toggleDownload(folder: any) {
    const dialogRef = this.dialog.open(DownloadFoldersComponent, {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      data: folder,
      panelClass: 'custom-modalbox',
    });

    dialogRef.componentInstance.dialogClosed.subscribe((result: boolean) => {
      if (result) dialogRef.close();
    });
  }
}
