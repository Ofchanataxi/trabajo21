import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { FileUpload } from 'src/app/atoms/button-upload/button-upload.component';

@Component({
  selector: 'app-show-list-of-files',
  templateUrl: './show-list-of-files.component.html',
  styleUrls: ['./show-list-of-files.component.scss'],
})
export class ShowListOfFilesComponent {
  @Input() files: File[] = [];
  @Input() filesMapped: FileUpload[] = [];
  @Input() requiredSignatures: boolean = false;
  @Input() totalPeopleRequiredToSign: number = 0;
  signs: any[] = [];
  
  onSignDataLoaded(signData: any): void {
    this.signs = signData?.signs;
  }

  reduceFileText(label: string) {
    const maxLength = 90;
    if (label.length <= maxLength) return label;
    const mitad = Math.floor(maxLength / 2);
    const textoTruncado = label.slice(0, mitad) + '...' + label.slice(-mitad);
    return textoTruncado;
  }
}
