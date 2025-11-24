import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { catchError, forkJoin, map, of } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-button-signs',
  templateUrl: './button-signs.component.html',
  styleUrls: ['./button-signs.component.css'],
})
export class ButtonSignsComponent {
  @Input() file: File;
  @Input() i: number;
  @Output() signDataLoaded = new EventEmitter<any>();
  hasSignsArr: boolean[] = [];
  progress: { [key: string]: { progress: number; completed: boolean } } = {};
  previousLengthFiles: number = 0;

  signData: any;
  hasSignData: boolean;
  constructor(
    private fileUploadService: FileUploadService,
    private messageService: MessageService
  ) {}

  loading: boolean = false;
  updateProgress() {
    this.progress = { ...this.progress };
  }

  reduceFileText(label: string) {
    const maxLength = 90;
    if (label.length <= maxLength) return label;
    const mitad = Math.floor(maxLength / 2);
    const textoTruncado = label.slice(0, mitad) + '...' + label.slice(-mitad);
    return textoTruncado;
  }

  ngOnInit(): void {
    // console.log('***************************** ngOnInit');
    this.loading = true;
    this.verifySign();
  }

  verifySign(): void {
    const successNameFiles: string[] = [];
    const errorFiles: number[] = [];

    const observable = this.fileUploadService.verifyFile(this.file).pipe(
      map(event => {
        this.loading = true;
        // console.log('El valor de event');
        // console.log(event);
        if (!this.progress[this.file.name]) {
          this.progress[this.file.name] = { progress: 0, completed: false };
        }

        if (event.status === 'progress') {
          const progress = event.progress ?? 0;
          this.progress[this.file.name].progress = progress;
          this.updateProgress();

          const reducedName = this.reduceFileText(this.file.name);
          if (!successNameFiles.includes(reducedName)) {
            successNameFiles.push(reducedName);
            // console.log('Archivo añadido a successNameFiles: ' + reducedName);
          }
        } else if (event.status === 'complete') {
          if (
            event.response.signsInformation?.signs &&
            event.response.signsInformation.signs.length > 0
          ) {
            this.signData = event.response.signsInformation;
            this.hasSignData = true;
            this.signDataLoaded.emit(this.signData);
          } else {
            this.signData = undefined;
            this.hasSignData = false;
          }

          this.progress[this.file.name].completed = true;
          this.updateProgress();
          this.loading = false;
        }

        return {
          status: event.status,
          fileTemp: this.file,
          response: event.response,
        };
      }),
      catchError(error => {
        console.error('Error en verifyFile:', error);
        errorFiles.push(this.i);
        this.previousLengthFiles--;
        this.loading = false;
        return of({ status: 'error', fileTemp: this.file });
      })
    );

    // Ya no usamos forkJoin para un solo observable
    observable.subscribe(result => {
      // console.log('Resultado del archivo verificado:', result);

      if (result.status === 'error') {
        console.warn(`El archivo ${result.fileTemp.name} falló en la verificación.`);
      }

      // console.log('successNameFiles: ', successNameFiles);
    });
  }

  hasAtLeatOneSign() {
    const hasAtLeatOneSign = this.hasSignData;
    return hasAtLeatOneSign;
  }
  checkInvalidSigns() {
    if (this.signData !== undefined) {
      let invalidSigns: boolean = this.signData.areThereProblems;
      return invalidSigns;
    }
    return false;
  }
}
