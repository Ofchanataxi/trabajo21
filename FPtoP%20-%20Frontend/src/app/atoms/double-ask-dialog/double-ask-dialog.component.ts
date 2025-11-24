import { Component, EventEmitter, Inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-double-ask-dialog',
  templateUrl: './double-ask-dialog.component.html',
  styleUrls: ['./double-ask-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DoubleAskDialogComponent {
  areMultipleFiles: boolean = false;
  multipleNameFiles: any[];
  nameFile: any;

  @Output() dialogClosed = new EventEmitter<boolean>();
  @Output() acceptRemove = new EventEmitter<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DoubleAskDialogComponent>,
    private router: Router
  ) {
    this.areMultipleFiles = data.areMultipleFiles;
    this.multipleNameFiles = data.multipleNameFiles;
    this.nameFile = data.nameFile;
  }

  closeDialogFromInside(): void {
    this.dialogRef.close();
    this.dialogClosed.emit(true);
  }

  acceptRemoveFiles(value: boolean) {
    this.closeDialogFromInside();
    this.acceptRemove.emit(value);
  }
  cancelRemoveFiles(value: boolean) {
    this.closeDialogFromInside();
  }
}
