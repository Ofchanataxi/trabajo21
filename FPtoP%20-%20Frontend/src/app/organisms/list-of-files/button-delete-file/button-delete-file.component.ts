import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { environment } from 'src/environments/environment';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { LoadDoubleAskDialogComponent } from '../../load-double-ask-dialog/load-double-ask-dialog.component';

@Component({
  selector: 'app-button-delete-file',
  templateUrl: './button-delete-file.component.html',
  styleUrls: ['./button-delete-file.component.css'],
})
export class ButtonDeleteFileComponent {
  showDoubleDropVerification: boolean = true;
  @Input() file: File;
  @Input() files: File[] = [];
  @Input() i: number;
  filesToDrop: File[] = [];

  progress: { [key: string]: { progress: number; completed: boolean } } = {};
  filesSigns: any[] = [];
  hasSignsArr: boolean[] = [];
  previousLengthFiles: number = 0;
  @ViewChild('askVerificationOne') askVerificationOne: LoadDoubleAskDialogComponent;

  constructor(
    private fileUploadService: FileUploadService,
    private messageService: MessageService
  ) {}

  @Output() dropFileOutput = new EventEmitter<number>();

  dropFile() {
    const indexToDelete = this.i;
    this.dropFileOutput.emit(indexToDelete);
  }

  // dropAllFiles() {
  //   if (this.dropzoneComponent) {
  //     this.filesToDrop = this.files;
  //     const oilWellId = 'example_oil_well_id';
  //     const deletedUrl = environment.serverUrl + environment.endpoints.uploadDocuments.url;

  //     const dropObservables = this.filesToDrop.map(file =>
  //       this.fileUploadService
  //         .dropFile(file!, { fileName: file.name, oilWellId: oilWellId }, deletedUrl)
  //         .pipe(
  //           catchError(error => {
  //             return of({ status: 'error', file });
  //           })
  //         )
  //     );

  //     forkJoin(dropObservables).subscribe(results => {
  //       const failedFiles = results
  //         .filter(result => result.status === 'error')
  //         .map(result => result.file.name);
  //       const allFilesDroped = failedFiles.length === 0;

  //       if (allFilesDroped) {
  //         this.dropzoneComponent.deleteAttachment(-1);
  //         this.messageService.add({
  //           severity: SlbSeverity.Success,
  //           summary: 'Eliminación Completada',
  //           detail: 'Todos los archivos se eliminaron correctamente.',
  //         });
  //       } else {
  //         this.messageService.add({
  //           severity: SlbSeverity.Error,
  //           summary: 'Problema en la Subida',
  //           detail: `Hubo un problema al subir los siguientes archivos: ${failedFiles.join(
  //             ', '
  //           )}. Inténtalo de nuevo.`,
  //         });
  //       }
  //     });
  //     this.dropzoneComponent.clearAllFiles();
  //     this.files = [];
  //     this.progress = {};
  //     this.filesSigns = [];
  //     this.hasSignsArr = [];
  //     this.previousLengthFiles = 0;
  //   }
  // }

  setDoubleVerificationAnswer(event: any) {
    console.log('setDoubleVerificationAnswer');
    console.log(event);
    if (Object.keys(event.args).length !== 0 && event.remove === true) {
      this.dropFile();
    } else {
      if (event.remove === true) {
        //this.dropAllFiles();
      }
    }
  }

  openDoubleVerificationOne(event: any) {
    let args: { [key: string]: any } = {
      i: this.i,
      file: this.file,
      event: event,
    };

    console.log('this.file');
    console.log(this.file);
    if (this.files.length !== 0) {
      this.askVerificationOne.nameFile = this.file.name;
      this.askVerificationOne.openDialog(args);
    }
  }
  // async dropFile() {
  //   this.dropzoneComponent.deleteAttachment(this.i);
  //   //FALTA LA LOGICA PARA BORRAR DEL SERVIDOR

  //   // const oilWellId = 'example_oil_well_id';
  //   // const deletedUrl = environment.serverUrl + environment.endpoints.uploadDocuments.url;

  //   // this.fileUploadService
  //   //   .dropFile(file!, { fileName: file.name, oilWellId: oilWellId }, deletedUrl)
  //   //   .subscribe({
  //   //     next: event => {
  //   //       if (event.status === 'complete') {
  //   //       }
  //   //     },
  //   //     error: error => {
  //   //       this.messageService.add({
  //   //         severity: SlbSeverity.Error,
  //   //         summary: 'Problema al Eliminar el archivo',
  //   //         detail: `Hubo un problema al subir ${file!.name}. Inténtalo de nuevo.`,
  //   //       });
  //   //     },
  //   //     complete: () => {
  //   //       this.messageService.add({
  //   //         severity: SlbSeverity.Success,
  //   //         summary: 'Eliminación Completada',
  //   //         detail: `El archivo ${
  //   //           file!.name
  //   //         } se eliminó correctamente de la carpeta de documentos del pozo.`,
  //   //       });
  //   //       this.filesSigns = this.filesSigns.splice(index, 1);
  //   //       this.hasSignsArr = this.filesSigns.splice(index, 1);

  //   //     },
  //   //   });
  // }
}
