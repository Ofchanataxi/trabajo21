import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LoadDoubleAskDialogComponent } from '../../load-double-ask-dialog/load-double-ask-dialog.component';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';

@Component({
  selector: 'app-button-delete-selected',
  templateUrl: './button-delete-selected.component.html',
  styleUrls: ['./button-delete-selected.component.scss'],
})
export class ButtonDeleteSelectedComponent {
  @ViewChild('askVerificationAll') askVerificationAll: LoadDoubleAskDialogComponent;

  @Output() dropAllEvent = new EventEmitter<number>();

  dropAllFiles() {
    this.dropAllEvent.emit(); // notifica al padre
  }

  openDoubleVerificationAll() {
    this.askVerificationAll.openDialog();
  }

  async dropFile(index: number, file: File, event: any) {
    //   const oilWellId = 'example_oil_well_id';
    //   const deletedUrl = environment.serverUrl + environment.endpoints.uploadDocuments.url;
    //   this.fileUploadService
    //     .dropFile(file!, { fileName: file.name, oilWellId: oilWellId }, deletedUrl)
    //     .subscribe({
    //       next: event => {
    //         if (event.status === 'complete') {
    //         }
    //       },
    //       error: error => {
    //         this.messageService.add({
    //           severity: SlbSeverity.Error,
    //           summary: 'Problema al Eliminar el archivo',
    //           detail: `Hubo un problema al subir ${file!.name}. Inténtalo de nuevo.`,
    //         });
    //       },
    //       complete: () => {
    //         this.messageService.add({
    //           severity: SlbSeverity.Success,
    //           summary: 'Eliminación Completada',
    //           detail: `El archivo ${
    //             file!.name
    //           } se eliminó correctamente de la carpeta de documentos del pozo.`,
    //         });
    //         this.filesSigns = this.filesSigns.splice(index, 1);
    //         this.hasSignsArr = this.filesSigns.splice(index, 1);
    //         this.dropzoneComponent.deleteAttachment(index);
    //       },
    //     });
  }

  setDoubleVerificationAnswer(event: any) {
    console.log('setDoubleVerificationAnswer');
    console.log(event);
    this.dropAllFiles();
  }
  //dropAllFiles() {
  // this.dropzoneComponent.clearAllFiles();
  // this.files = [];
  // if (this.dropzoneComponent) {
  //   // this.filesToDrop = this.files;
  //   // const oilWellId = 'example_oil_well_id';
  //   // const deletedUrl = environment.serverUrl + environment.endpoints.uploadDocuments.url;
  //   // const dropObservables = this.filesToDrop.map(file =>
  //   //   this.fileUploadService
  //   //     .dropFile(file!, { fileName: file.name, oilWellId: oilWellId }, deletedUrl)
  //   //     .pipe(
  //   //       catchError(error => {
  //   //         return of({ status: 'error', file });
  //   //       })
  //   //     )
  //   // );
  //   // forkJoin(dropObservables).subscribe(results => {
  //   //   const failedFiles = results
  //   //     .filter(result => result.status === 'error')
  //   //     .map(result => result.file.name);
  //   //   const allFilesDroped = failedFiles.length === 0;
  //   //   if (allFilesDroped) {
  //   //     this.dropzoneComponent.deleteAttachment(-1);
  //   //     this.messageService.add({
  //   //       severity: SlbSeverity.Success,
  //   //       summary: 'Eliminación Completada',
  //   //       detail: 'Todos los archivos se eliminaron correctamente.',
  //   //     });
  //   //   } else {
  //   //     this.messageService.add({
  //   //       severity: SlbSeverity.Error,
  //   //       summary: 'Problema en la Subida',
  //   //       detail: `Hubo un problema al subir los siguientes archivos: ${failedFiles.join(
  //   //         ', '
  //   //       )}. Inténtalo de nuevo.`,
  //   //     });
  //   //   }
  //   // });
  //   // this.dropzoneComponent.clearAllFiles();
  //   // this.files = [];
  //   // this.progress = {};
  //   // this.filesSigns = [];
  //   // this.hasSignsArr = [];
  //   // this.previousLengthFiles = 0;
  // }
  //}
}
