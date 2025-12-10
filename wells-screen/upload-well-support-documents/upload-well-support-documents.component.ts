import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { ButtonUploadComponent } from 'src/app/atoms/button-upload/button-upload.component';
import { UpdateFilesFromZipService } from 'src/app/services/update-files-from-zip.service';
import { VerifyStandardizationService } from '../../../services/verify-standardization.service';
import { ObtainElementsOfReleaseService } from '../../../services/obtain-elements-of-release.service';
import { GetDocumentsOfElementService } from '../../../services/get-documents-of-element.service';
import { forkJoin } from 'rxjs'; // Importar forkJoin
import { mergeMap } from 'rxjs/operators'; // Importar mergeMap
import { map } from 'rxjs/operators';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { firstValueFrom } from 'rxjs';
import { has } from 'cypress/types/lodash';
import { DocumentofElement } from 'src/app/shared/components/organism/support-document-list/support-document-list.component'

@Component({
  selector: 'app-upload-well-support-documents',
  templateUrl: './upload-well-support-documents.component.html',
  styleUrls: ['./upload-well-support-documents.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadWellSupportDocumentsComponent implements OnInit {
  @Output() hasDocumentsEvent = new EventEmitter<boolean>();
  @Output() rowDataChange = new EventEmitter<any[]>();
  public newlyAddedFiles: any[];
  dataTransformed: any;
  public serialsMap = new Map<string, any[]>();
  public inspectionOitsMap = new Map<string, any[]>();
  public repairOitsMap = new Map<string, any[]>();
  public filesFromZip: any;
  constructor(
    private updateFilesFromZipService: UpdateFilesFromZipService,
    private verifyStandardizationService: VerifyStandardizationService,
    private getDocumentsOfElementService: GetDocumentsOfElementService,
    private obtainElementsOfReleaseService: ObtainElementsOfReleaseService,
    private cd: ChangeDetectorRef
  ) {}

  private sharedService = inject(SharedDataService);

  ngOnInit(): void {
    this.updateFilesFromZipService.files$.subscribe(({ data, index }) => {
      this.updateSuppDocsDialog(data, index);
    });
  }
  releaseInfo: any;

  dataWithFiles: any = [];

  async addFilesToData(data: any) {
    let newData: any = [];
    for (let i = 0; i < data.length; i++) {
      const elementData = data[i];
      let newDocumentsOfElement: any = [];

      const documentsOfElement = elementData.documentsOfElement;

      if (data.length > 0) {
        this.hasDocumentsEvent.emit(true);
      }
      for (let j = 0; j < documentsOfElement.length; j++) {
        const elementDocumentsOfElement = documentsOfElement[j];
        const savedFilesMetaData = elementDocumentsOfElement.savedFilesMetaData;

        let newSavedFilesMetaData: any = [];
        for (let k = 0; k < savedFilesMetaData.length; k++) {
          const savedDoc = savedFilesMetaData[k];

          try {
            // Espera a que se resuelva el observable como una promesa
            const blob = await firstValueFrom(
              this.getDocumentsOfElementService.getFileFromPath(
                savedDoc.filePath,
                savedDoc.idStoredFiles,
                savedDoc.fileName
              )
            );

            // Convertir el Blob en un File
            const file = new File([blob], savedDoc.fileName, { type: savedDoc.fileExtension });

            newSavedFilesMetaData.push(file);
          } catch (error) {
            console.error('Error al obtener el archivo:', error);
            //throw error; // Maneja el error si es necesario
          }
        }

        let tempDocumentsOfElement = {
          ...elementDocumentsOfElement,
          filesSaved: newSavedFilesMetaData,
        };
        newDocumentsOfElement.push(tempDocumentsOfElement);
      }

      let tempElementData = {
        ...elementData,
        documentsOfElement: newDocumentsOfElement,
      };
      newData.push(tempElementData);
    }
    return newData;
  }

  public handleFileChange(event: any): void {
    if (!event || !Array.isArray(event.updatedFileObjects)) {
      return;
    }

    const newDataTransformed = this.dataTransformed.map((element: { id: number; documentsOfElement: DocumentofElement[]; }) => {
      if (element.id !== event.elementId) {
        return element;
      }

      return {
        ...element,
        documentsOfElement: element.documentsOfElement.map((doc: { idStandardElementsRequiredFiles: number; }) => {
          if (doc.idStandardElementsRequiredFiles !== event.documentId) {
            return doc;
          }

          return {
            ...doc,
            filesSaved: event.updatedFileObjects.map((f: { file: File; }) => f.file),
            savedFilesMetaData: event.updatedFileObjects.map((f: { idStoredFiles: any; pathToFile: string | null; file: { name: any; type: any; }; }) => ({
              idStoredFiles: f.idStoredFiles,
              filePath: f.pathToFile,
              fileName: f.file.name,
              fileExtension: f.file.type,
            })),
          };
        })
      };
    });

    this.dataTransformed = newDataTransformed;
    
    this.rowDataChange.emit(this.dataTransformed);
  }

  transformData(data: any) {
    let newData: any = [];
    for (let i = 0; i < data.length; i++) {
      const elementData = data[i];
      let newDocumentsOfElement: any = [];

      const documentsOfElement = elementData.documentsOfElement;

      for (let j = 0; j < documentsOfElement.length; j++) {
        const elementDocumentsOfElement = documentsOfElement[j];
        const idStandardElementsRequiredFiles =
          elementDocumentsOfElement.idStandardElementsRequiredFiles;
        if (elementData.savedDocuments !== null) {
          let tempDocumentsOfElement = {
            ...elementDocumentsOfElement,
            savedFilesMetaData: elementData.savedDocuments[idStandardElementsRequiredFiles] || [],
          };
          newDocumentsOfElement.push(tempDocumentsOfElement);
        } else {
          let tempDocumentsOfElement = {
            ...elementDocumentsOfElement,
            savedFilesMetaData: [],
          };
          newDocumentsOfElement.push(tempDocumentsOfElement);
        }
      }

      const temp = { ...elementData };

      delete temp.documentsOfElement;
      delete temp.savedDocuments;

      let tempElementData = {
        ...temp,
        documentsOfElement: newDocumentsOfElement,
      };
      newData.push(tempElementData);
    }
    return newData;
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    
    if (changes['rowData'] && this.rowData && this.rowData.length > 0) {
      this.dataTransformed = this.rowData;
    } else {
      this.sharedService.currentElement.subscribe((data: any) => {
        if (data && data.releaseID) {
          this.releaseInfo = data;
        }
      });
      const idBusinessLine = 1;
      this.obtainElementsOfReleaseService
        .getElements(parseInt(this.releaseInfo.releaseID))
        .pipe(
          mergeMap((response: any) => {
            return forkJoin(
              response.data.map((element: any) => {
                const obj = {
                  idStandardElements: element.idStandardElements,
                  idStandardCondition: element.idCondition,
                };
                return this.getDocumentsOfElementService.getData(obj).pipe(
                  map(secondResponse => {
                    const objToResponse = {
                      ...element,
                      documentsOfElement: secondResponse.data,
                    };
                    return objToResponse;
                  })
                );
              })
            );
          })
        )
        .subscribe(async responses => {
          let dataTransformed = this.transformData(responses);
          dataTransformed = await this.addFilesToData(dataTransformed);
          this.dataTransformed = dataTransformed;
          this._createMappingDictionaries();
        });
    }
  }

  @Input() userPipeSelected: any;
  @Input() rowData: any[] = [];
  @Input() completedSteps: boolean[] = [];
  @Input() summaryComponent: any;
  @Output() sendDataToNextStep = new EventEmitter<{
    rowData: any[];
    userPipeSelected: string;
    isNext: boolean;
  }>();
  @Output() completedStepsEvent = new EventEmitter<boolean[]>();

  public handleSingleFileUpload(successfulUploads: any[]): void {
    this.newlyAddedFiles = successfulUploads;
  }

  sendNextData() {

    this.sendDataToNextStep.emit({
      rowData: this.dataTransformed,
      userPipeSelected: this.userPipeSelected,
      isNext: true,
    });
  }
  updateCompletedSteps() {
    this.completedStepsEvent.emit(this.completedSteps);
  }

  @ViewChildren('itpSuppFiles')
  itpSuppFiles: QueryList<ButtonUploadComponent>;
  @ViewChildren('mtcSuppFiles') mtcSuppFiles: QueryList<ButtonUploadComponent>;

  goOnSummary(): void {
    if (this.validateEnablingDocuments()) {
      this.sendNextData();
    } else {
      alert('Falto hacer algo');
    }
  }

  private _createMappingDictionaries(): void {
    this.serialsMap.clear();
    this.inspectionOitsMap.clear();
    this.repairOitsMap.clear();

    if (!this.dataTransformed) return;

    for (const element of this.dataTransformed) {
      const elementInfo = {
        id: element.id,
        documentsOfElement: element.documentsOfElement,
        oitInspection: element.oitInspection,
        oitReparation: element.oitReparation,
        name: element.pecDescription,
        condition: element.condition,
        elementID: element.id,
        serial: element.serial,
        partNumber: element.partNumber,
      };

      if (element.serial) {
        if (!this.serialsMap.has(element.serial)) {
          this.serialsMap.set(element.serial, []);
        }
        this.serialsMap.get(element.serial)?.push(elementInfo);
      }

      if (element.oitInspection) {
        if (!this.inspectionOitsMap.has(element.oitInspection)) {
          this.inspectionOitsMap.set(element.oitInspection, []);
        }
        this.inspectionOitsMap.get(element.oitInspection)?.push(elementInfo);
      }

      if (element.oitReparation) {
        if (!this.repairOitsMap.has(element.oitReparation)) {
          this.repairOitsMap.set(element.oitReparation, []);
        }
        this.repairOitsMap.get(element.oitReparation)?.push(elementInfo);
      }
    }
  }

  validateEnablingDocuments(): boolean {
    this.completedSteps[1] = true;
    this.updateCompletedSteps();
    return true;
  }

  updateSuppDocsDialog(incomingData: any[], itemIndex: number) {
    let supportDocumentsItems = incomingData.map((element: any) => element.file);
    let buttonUpload = this.itpSuppFiles.toArray()[itemIndex];
    let temporalFiles = buttonUpload.files;
    const combinedFiles = [...supportDocumentsItems, ...temporalFiles];

    buttonUpload.onFilesChange(combinedFiles);
    buttonUpload.dropzoneComponent.files = combinedFiles;
  }

  callback(response: any) {
    let idStoredFiles = response.respuestaServidor.response.saveResponse.idStoredFiles;
  }

  public getFilesFromZipByUser(event: any): void {
    this.filesFromZip = event;
  }
  trackById(index: number, item: any): number {
    return item.id;
  }
}
