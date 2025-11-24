import {
  Component,
  Input,
  ViewEncapsulation,
  ViewChild,
  SimpleChanges,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FileUpload {
  file: File;
  stateUpload: { progress: number; completed: boolean };
  idStoredFiles: any;
  pathToFile: string | null;
}

interface ResponseSaved {
  fileToSave: File;
  respuestaServidor: any;
}

interface ResponseSavedDelete {
  paramsToDelete: object;
  respuestaServidor: any;
}

@Component({
  selector: 'app-button-upload',
  templateUrl: './button-upload.component.html',
  styleUrls: ['./button-upload.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ButtonUploadComponent implements OnInit, OnChanges {
  @Input() label: string = 'Label';
  @Input() description: string = '';
  @Input() initialFiles: FileUpload[] = [];
  @Input() extension: string = ''; //MIME TYPE
  @Input() showIsRequired: boolean = false;
  @Input() multipleFile: boolean = true;
  @Input() requiredSignatures: boolean = false;
  @Input() totalPeopleRequiredToSign: number = 0;

  @Input() editDisabled: boolean = false;

  @Input() callbackAfterSave: Function = () => {};
  @Input() urlToSave: string = '';
  @Input() paramsToSave: object = {};
  @Input() newFilesToSaved: File[] = [];

  @Input() callbackAfterDelete: Function = () => {};
  @Input() urlToDelete: string = '';
  @Input() paramsToDelete: object = {};
  @Output() fileListchange = new EventEmitter<FileUpload[]>();

  filesMapped: FileUpload[] = []; /// Permite agregar variables iniciales
  files: File[] = [];
  @ViewChild('dropzone') dropzoneComponent: SlbDropzoneComponent;

  constructor(
    public dialog: MatDialog,
    private fileUploadService: FileUploadService
  ) {}

  async ngOnInit(): Promise<void> {
    this.updateFileLists();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFiles'] || changes['newFilesToSaved']) {
      this.updateFileLists();
    }
  }

  private async updateFileLists(): Promise<void> {
    const newFilesMapped: FileUpload[] = [];

    if (this.initialFiles) {
      let initialFilesTemp = this.initialFiles;

      for (let j = 0; j < initialFilesTemp.length; j++) {
        const initialFile = initialFilesTemp[j];

        try {
          newFilesMapped.push({
            file: initialFile.file,
            stateUpload: { progress: 100, completed: true },
            idStoredFiles: initialFile.idStoredFiles,
            pathToFile: initialFile.pathToFile,
          });
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (this.newFilesToSaved && this.newFilesToSaved.length > 0) {
      for (const newFileToSave of this.newFilesToSaved) {
        try {
          const response = await this.saveFileOnServer(newFileToSave);
          const idStoredFiles = response.respuestaServidor.response.saveResponse.idStoredFiles;
          const pathToFile = response.respuestaServidor.response.saveResponse.pathToFile;

          newFilesMapped.push({
            file: newFileToSave,
            stateUpload: { progress: 100, completed: true },
            idStoredFiles: idStoredFiles,
            pathToFile: pathToFile,
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
    this.filesMapped = newFilesMapped;
    this.fileListchange.emit(this.filesMapped);

    this.files = this.filesMapped.map(fm => fm.file);
    if (this.dropzoneComponent) {
      this.dropzoneComponent.files = this.files;
    }
  }

  updateDataToChildren(filesMapped: FileUpload[]) {
    let tempArr2 = [];

    for (let i = 0; i < filesMapped.length; i++) {
      const fileMapped = filesMapped[i];
      tempArr2.push(fileMapped.file);
    }

    if (this.dropzoneComponent) {
      this.dropzoneComponent.files = tempArr2;
    }

    this.files = tempArr2;
  }

  async dropAllEvent() {
    for (let i = 0; i < this.filesMapped.length; i++) {
      const deleteFile = this.filesMapped[i];
      //Proceso de eliminacion del archivo

      if (this.urlToDelete !== '' && deleteFile.idStoredFiles !== null) {
        const paramsToDelete = {
          idStoredFiles: deleteFile.idStoredFiles,
          ...this.paramsToDelete,
        };
        const response = await this.deleteFileOnServer(paramsToDelete);
      }
    }

    this.filesMapped = [];
    this.updateDataToChildren(this.filesMapped);
    this.fileListchange.emit(this.filesMapped);
  }

  async dropFile(index: number) {
    const indexToDelete = index;
    const arrayDeleteFile: FileUpload[] = this.filesMapped.splice(indexToDelete, 1); //Por un lado obtenemos y por otro se modifico el this.filesMapped
    const deleteFile = arrayDeleteFile[0];

    if (this.urlToDelete !== '' && deleteFile.idStoredFiles !== null) {
      const paramsToDelete = {
        idStoredFiles: deleteFile.idStoredFiles,
        ...this.paramsToDelete,
      };
      const response = await this.deleteFileOnServer(paramsToDelete);
    }
    //Proceso de eliminacion del archivo por medio de deleteFile
    this.updateDataToChildren(this.filesMapped);
    this.fileListchange.emit(this.filesMapped);
  }

  async deleteFileOnServer(paramsToDelete: any) {
    let respuestaServidor: any;

    const response = await new Promise<ResponseSavedDelete>((resolve, reject) => {
      this.fileUploadService.dropFile(paramsToDelete, this.urlToDelete).subscribe({
        next: mensaje => {
          if (mensaje.status === 'complete') {
            respuestaServidor = mensaje;
          }
        },
        error: err => {
          console.error('Error al subir:', err);
          reject(err); // permite que async/await detecte error
        },
        complete: async () => {
          const response = {
            paramsToDelete,
            respuestaServidor,
          };
          await this.callbackAfterDelete(response);

          resolve(response); // finaliza la promesa
        },
      });
    });
    return response;
  }

  private normalizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '');
  }

  async saveFileOnServer(fileToSave: File) {
    let respuestaServidor: any;
    const normalizedName = this.normalizeFileName(fileToSave.name);

    const sanitizedFile = new File([fileToSave], normalizedName, {
      type: fileToSave.type,
    });

    const response = await new Promise<ResponseSaved>((resolve, reject) => {
      this.fileUploadService
        .uploadFile(sanitizedFile, this.paramsToSave, this.urlToSave)
        .subscribe({
          next: mensaje => {
            if (mensaje.status === 'complete') {
              respuestaServidor = mensaje;
            }
          },
          error: err => {
            console.error('Error al subir:', err);
            reject(err);
          },
          complete: async () => {
            const response = {
              fileToSave: sanitizedFile, 
              respuestaServidor,
            };
            await this.callbackAfterSave(response);
            resolve(response);
          },
        });
    });
    return response;
  }

  async onFilesChange(event: File[]) {
    const eventFiles = [...event];
    const existingFiles = [...this.filesMapped];
 
    // por cada archivo existente buscar una coincidencia en archivos del evento
    // eliminar las coincidencias para obtener solo los nuevos archivos
    for (const existingFile of existingFiles) {
      const matchIndex = eventFiles.findIndex(
        (eventFile) =>
          eventFile.name === existingFile.file.name &&
          eventFile.size === existingFile.file.size &&
          eventFile.lastModified === existingFile.file.lastModified
      );
      if (matchIndex > -1) {
        eventFiles.splice(matchIndex, 1);
      }
    }
 
    // lo que queda en arrayOfNewElements son los archivos nuevos
    const arrayOfNewElements = eventFiles;
 
    if (arrayOfNewElements.length === 0) {
      return;
    }
 
    const tempArr: FileUpload[] = [...this.filesMapped];
 
    for (let i = 0; i < arrayOfNewElements.length; i++) {
      const fileReceived = arrayOfNewElements[i];
      let idStoredFiles = null;
      try {
        if (this.urlToSave !== '') {
          const response = await this.saveFileOnServer(fileReceived);
          idStoredFiles = response.respuestaServidor.response.saveResponse.idStoredFiles;
        }

        let tempObj: FileUpload = {
          file: fileReceived,
          stateUpload: { progress: 100, completed: true },
          idStoredFiles: idStoredFiles,
          pathToFile: null,
        };
        tempArr.push(tempObj);
      } catch (error) {
        console.error(error);
      }
    }
    this.filesMapped = tempArr;
    this.updateDataToChildren(this.filesMapped);
    this.fileListchange.emit(this.filesMapped);
  }
}
