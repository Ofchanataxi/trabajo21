import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { firstValueFrom } from 'rxjs';
import { GetDocumentsOfElementService } from 'src/app/services/get-documents-of-element.service';
import { DownloadDocumentsComponent } from 'src/app/shared/components/templates/download-documents/donwload-documents.component';

@Component({
  selector: 'shared-button-download-files',
  templateUrl: './button-download-files.component.html',
  styleUrls: ['./button-download-files.component.scss'],
})
export class DownloadFilesComponent {

  @Input() file: any;

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  toggleDownload(file: any) {
    
    const dialogRef = this.dialog.open(DownloadDocumentsComponent, {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      data: file,
      panelClass: 'custom-modalbox',
    });
    dialogRef.componentInstance.dialogClosed.subscribe((result: boolean) => {
      if (result) dialogRef.close();
    });
  }
}
