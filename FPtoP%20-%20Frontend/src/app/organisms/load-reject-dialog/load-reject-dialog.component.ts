import { Component, ContentChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RejectInformationDialogComponent } from 'src/app/shared/components/templates/reject-information-dialog/reject-information-dialog.component';

@Component({
  selector: 'app-load-reject-dialog',
  templateUrl: './load-reject-dialog.component.html',
  styleUrls: ['./load-reject-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoadRejectDialogComponent {
  constructor(public dialog: MatDialog) {}
  @Input() wellRejectInformation: {};
  @Input() idUser!: number;
  @Input() idToState!: number;
  @Input() emailUser!: string;
  @Input() idStandardStates!: number;

  openDialog() {
    const dialogRef = this.dialog.open(RejectInformationDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      data: {
        wellRejectInformation: this.wellRejectInformation,
        idUser: this.idUser,
        idToState: this.idToState,
        emailUser: this.emailUser,
        idStandardStates: this.idStandardStates,
      },
      panelClass: 'custom-modalbox',
    });

    dialogRef.componentInstance.dialogClosed.subscribe((result: boolean) => {
      if (result) {
        this.dialog.closeAll();
      }
    });
  }

  data(event: any) {
    this.openDialog();
  }
}
