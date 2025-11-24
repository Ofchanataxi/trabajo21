import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';

@Component({
  selector: 'app-edit-list-of-files',
  templateUrl: './edit-list-of-files.component.html',
  styleUrls: ['./edit-list-of-files.component.scss'],
})
export class EditListOfFilesComponent {
  @Input() files: File[] = [];
  @Input() requiredSignatures: boolean = false;
  @Input() totalPeopleRequiredToSign: number = 0;
  @Output() dropAllEvent = new EventEmitter<number>();
  @Output() dropFileOutput = new EventEmitter<number>();

  signs: any[] = [];

  dropFile(index: number) {
    const indexToDelete = index;
    this.dropFileOutput.emit(indexToDelete);
  }

  dropAllFiles() {
    this.dropAllEvent.emit(); // notifica al padre
  }

  reduceFileText(label: string) {
    const maxLength = 90;
    if (label.length <= maxLength) return label;
    const mitad = Math.floor(maxLength / 2);
    const textoTruncado = label.slice(0, mitad) + '...' + label.slice(-mitad);
    return textoTruncado;
  }

  onSignDataLoaded(signData: any): void {
    this.signs = signData?.signs;
  }

}
