import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DoubleAskDialogComponent } from 'src/app/atoms/double-ask-dialog/double-ask-dialog.component';

@Component({
  selector: 'app-load-double-ask-dialog',
  templateUrl: './load-double-ask-dialog.component.html',
  styleUrls: ['./load-double-ask-dialog.component.scss'],
})
export class LoadDoubleAskDialogComponent {
  @Input() areMultipleFiles: boolean = false;
  @Input() multipleNameFiles: any[];
  @Input() nameFile: any = '';
  @Output() remove = new EventEmitter<{ [key: string]: any }>();

  constructor(public dialog: MatDialog) {}

  openDialog(args: { [key: string]: any } = {}) {
    const dialogRef = this.dialog.open(DoubleAskDialogComponent, {
      data: {
        areMultipleFiles: this.areMultipleFiles,
        multipleNameFiles: this.multipleNameFiles,
        nameFile: this.nameFile,
      },
    });

    dialogRef.componentInstance.dialogClosed.subscribe((result: boolean) => {
      if (result) {
        this.dialog.closeAll();
      }
    });

    dialogRef.componentInstance.acceptRemove.subscribe((result: boolean) => {
      let answers: { [key: string]: any } = { remove: result, args: args };
      this.remove.emit(answers);
    });
  }
}
