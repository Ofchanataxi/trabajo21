import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { forEach } from 'cypress/types/lodash';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/api.service';
import {
  ButtonUploadComponent,
  FileUpload,
} from 'src/app/atoms/button-upload/button-upload.component';
import { LogisticService } from 'src/app/features/logistic/services/logistic.service';
import { WellTableInformationComponent } from 'src/app/organisms/well-table-information/well-table-information.component';
import { VerifyStandardizationService } from 'src/app/services/verify-standardization.service';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { environment } from 'src/environments/environment';
import { ObtainElementsOfSheetService } from '../../../services/obtain-elements-of-sheet.service';
import { ReleaseService } from 'src/app/services/release.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ExtractionService } from 'src/app/services/extract-data-from-itp';

@Component({
  selector: 'shared-add-well-information-screen',
  templateUrl: './add-well-information-screen.component.html',
  styleUrls: ['./add-well-information-screen.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddWellInformationScreenComponent implements OnInit {
  public standardConditions: string[] = [];
  public isExtracting = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private obtainElementsOfSheetService: ObtainElementsOfSheetService,
    private releaseService: ReleaseService,
    private extractionService: ExtractionService
  ) {}

  onSubmit(): void {
    console.log('Se envia');
  }

  formulario: FormGroup = new FormGroup({
    conditionID: new FormControl(1),
  });

  get conditionIDControl(): FormControl {
    return (this.formulario.get('conditionID') as FormControl) || new FormControl('');
  }

  conditions = [
    {
      key: 1,
      value: 'NUEVO',
    },
    {
      key: 2,
      value: 'INSPECCIONADO',
    },
    {
      key: 3,
      value: 'INSPECCIONADO-REPARADO',
    },
    {
      key: 4,
      value: 'REUTILIZADO',
    },
  ];

  idConditionSelected: number = 1;

  selectionChangeEvent(idCondition: any): void {
    console.log('Se envia');
    console.log(idCondition);
    this.idConditionSelected = idCondition;
    this.updateConditions();
  }

  itp: any = [];
  showITPInput: Boolean = false;

  updateConditions(): void {
    console.log('ITP files');

    let value = 'NUEVO';
    for (let i = 0; i < this.conditions.length; i++) {
      const element = this.conditions[i];

      if (element.key === this.idConditionSelected) {
        value = element.value;
      }
    }
    console.log('this.showITPInput');
    console.log(this.showITPInput);
    this.showITPInput = this.loadFilesInformation.itpFiles ? true : false;
    console.log(this.showITPInput);
    this.itp = this.loadFilesInformation.itpFiles[value] || [];
    console.log(this.itp);
  }

  async ngOnInit(): Promise<void> {
    try {
      const conditionsData = await this.releaseService.getStandardCondition().toPromise();
      const actualArray = conditionsData.data || conditionsData;
      if (Array.isArray(actualArray)) {
        this.standardConditions = actualArray.map((item: any) => item.condition);
      }
    } catch (error) {
      console.error('Error fetching standard conditions in parent component', error);
      this.standardConditions = [];
    }
    const loadFilesInformation = this.loadFilesInformation;
    console.log(loadFilesInformation);
    this.updateConditions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFiles'] && this.initialFiles?.length > 0) {
      this.initialFileToTransform = this.initialFiles.filter(
        f => f.idStandardFileTypesOfRelease === 1
      );
      if (this.loadFilesInformation.id === 2) {
        this.initialAvailableFiles = this.initialFiles.filter(
          f => f.idStandardFileTypesOfRelease === 13
        );
      } else {
        this.initialAvailableFiles = this.initialFiles.filter(
          f => f.idStandardFileTypesOfRelease === 2
        );
      }
    }
    if (changes['loadFilesInformation']) {
      this.updateConditions();
    }
  }

  @ViewChild('wellTable') wellTable: WellTableInformationComponent;

  @Input() completedSteps: boolean[] = [];
  @Input() stepper: MatStepper;
  @Input() rowData: any[] = [];
  @Input() loadFilesInformation: { [key: string]: any } = {};
  @Input() initialFiles: (FileUpload & { idStandardFileTypesOfRelease: number })[] = [];
  @Input() idRelease: string;
  @Output() completedStepsEvent = new EventEmitter<boolean[]>();
  @Output() sendDataToNextStep = new EventEmitter<{
    rowData: any[];
    userPipeSelected: string;
    isNext: boolean;
  }>();
  @Output() sendTallySheetFile = new EventEmitter<QueryList<ButtonUploadComponent>>();
  @Input() callback: Function = () => {}; // Recibir el callback como Input
  @Input() callbackAfterDelete: Function = () => {};

  @Input() sheetsName: any = [];
  @Input() dataToTransform: any;
  @Input() sheetSelected: any;
  @Output() rowDataFromTableEvent = new EventEmitter<string>();
  @Output() sheetSelectedChangeEvent = new EventEmitter<string>();
  @Output() sheetSelectedChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() reloadedFileObject: File | null = null;

  //dataToTransform: any;
  public rowDataFromTable: any = [];
  initialFileToTransform: FileUpload[] = [];
  initialAvailableFiles: FileUpload[] = [];

  isElementInDatabase: boolean = false;
  rowDataTable: any;
  titleOfSheet: any;

  urlToSave = environment.serverUrl + environment.endpoints.fileUploadToRelease.url;
  urlToDelete = `${environment.serverUrl}${environment.endpoints.fileManagement.dropFileOfRelease.url}`;

  sendDataToTransform() {
    const fileToProcess = this.dataToTransform?.file || this.reloadedFileObject;

    if (!fileToProcess) {
      console.error('Error: No hay ningún archivo para procesar (ni nuevo ni recargado).');
      this.messageService.add({
        severity: SlbSeverity.Error,
        summary: 'No se encontró un archivo para procesar.',
      });
      return;
    }

    if (!this.sheetSelected) {
      console.warn('Advertencia: No se ha seleccionado ninguna pestaña.');
      this.messageService.add({
        severity: SlbSeverity.Warning,
        summary: 'Por favor, seleccione una pestaña para continuar.',
      });
      return;
    }

    console.log('Archivo a procesar:', fileToProcess);
    console.log('Pestaña seleccionada:', this.sheetSelected);

    const responsedata = this.obtainElementsOfSheetService
      .sendData({ file: fileToProcess, sheetSelected: this.sheetSelected })
      .subscribe({
        next: (response: any) => {
          if (response.status === 'progress') {
            const progress = response.progress ?? 0;
            console.log('Progreso:', progress);
          }
          if (response.status === 'complete') {
            console.log('Operación completada');
            console.log(response);
            if (response.response.elements && response.response.title) {
              this.rowDataFromTable = response.response.elements;
              console.log('Datos recibidos del servidor:', this.rowDataFromTable);
            } else {
              console.log('No se encontraron elementos en la respuesta');
            }
            console.log('this.rowDataFromTable');
            console.log(this.rowDataFromTable);
            this.cdRef.detectChanges();
          }
        },
        error: error => {
          console.log('Error en la respuesta del servidor:', error);
        },
        complete: () => {
          console.log('Operación completada completamente.');
        },
      });
  }

  private transformDataForTable(data: { [key: string]: string[] }): any[] {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }

    const backendKeys = Object.keys(data);
    if (backendKeys.length === 0) return [];

    const numRows = data[backendKeys[0]].length;
    const transformedData = [];

    for (let i = 0; i < numRows; i++) {
      const newRow: Record<string, any> = {};
      for (const backendKey of backendKeys) {
        const tableKey = this.headerMap[backendKey] || backendKey.toLowerCase();

        newRow[tableKey] = data[backendKey][i];
      }
      transformedData.push(newRow);
    }
    return transformedData;
  }

  private headerMap: { [key: string]: string } = {
    DESCRIPCIÓN: 'description',
    CANTIDAD: 'quantity',
    'NÚMERO DE SERIE': 'serial',
    CONDICIÓN: 'condition',
    OBSERVACIONES: 'observations',
    FABRICANTE: 'brand',
    'NÚMERO DE LOTE': 'serial',
    'NÚMERO DE SERIE/MODELO': 'modelo',
    'CANTIDAD DE ACCESORIOS REPARADOS OPERATIVOS': 'quantity',
  };

  public mtcFileList: File[] = [];

  updateInitialFile(event: any) {
    if (this.loadFilesInformation.idTypeOfRelease === 2) {
      this.mtcFileList = event.map((e: any) => e.file);
      console.log('MTCs cargados:', this.mtcFileList);
    } else {
      this.reloadedFileObject = event.length > 0 ? event[0].file : null;
      if (event.length === 0) {
        this.reloadedFileObject = null;
      }
    }
  }

  sendITPToExtractData() {
    const fileToProcess = this.dataToTransform?.file || this.reloadedFileObject;
    let releaseType = this.loadFilesInformation.idTypeOfRelease;
    let mtcFilesToSend: File[] = [];
    let id = this.loadFilesInformation.id;

    if (releaseType === 2 && id === 1) {
      if (this.mtcFileList && this.mtcFileList.length > 0) {
        console.log('Modo Tally + MTC activado (Release Type 7)');
        releaseType = 7;
        mtcFilesToSend = this.mtcFileList;
      }
    }

    if (fileToProcess && releaseType) {
      this.isExtracting = true;

      this.extractionService.extractData(fileToProcess, releaseType, mtcFilesToSend).subscribe({
        next: response => {
          let tableData = [];

          // --- CORRECCIÓN: Manejar respuesta tipo Array (Tally) ---
          if (Array.isArray(response.extracted_data)) {
            // Mapeo manual de las columnas del Backend -> Frontend
            tableData = response.extracted_data.map((item: any) => ({
              // Mapea aquí las columnas según tu 'fieldsTable'
              heat: item['Heat #'],
              serial: item['Pipe #'], // 'Pipe #' del excel va a 'serial'
              quantity: item['Length'], // Usamos 'Length' como cantidad/longitud
              'Steel Grade (del MTC)': item['Steel Grade'], // Tu nueva columna clave

              // Datos adicionales o por defecto
              description: item['URC'] || 'Tubería',
              condition: 'NUEVO', // Valor por defecto

              // Guardamos el resto de propiedades por si acaso
              ...item,
            }));

            console.log('Datos Tally procesados:', tableData);
          } else {
            // Lógica antigua para los otros extractores (objeto de columnas)
            tableData = this.transformDataForTable(response.extracted_data);
          }
          // -------------------------------------------------------

          this.rowDataFromTable = tableData;
          this.isExtracting = false;

          const confirmation: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Success,
            summary: 'Datos extraídos correctamente',
            detail: `Se cargaron ${tableData.length} registros.`,
          };
          this.messageService.add(confirmation);
        },
        error: err => {
          console.error('Error al extraer los datos:', err);
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Error,
            summary: 'Error al extraer los datos',
            detail: err.error?.detail || 'Error procesando los archivos.',
          };
          this.messageService.add(alert);
          this.isExtracting = false;
        },
      });
    } else {
      console.warn('Faltan archivos.');
    }
  }

  selectionSheetChange(event: any) {
    console.log('Se selecciono');
    console.log(event.value);
    this.sheetSelected = event.value;
    this.sheetSelectedChangeEvent.emit(event.value);
  }

  private verifyStandarization = inject(VerifyStandardizationService);
  private logisticService = inject(LogisticService);
  private sharedService = inject(SharedDataService);

  updateCompletedSteps() {
    this.completedStepsEvent.emit(this.completedSteps);
  }

  private releaseDataSummaryProcessed = Object;
  private releaseInfo = Object;

  sendNextData() {
    this.sendDataToNextStep.emit({
      rowData: this.rowDataFromTable,
      userPipeSelected: this.userPipeSelected,
      isNext: true,
    });
    this.sendTallySheet();
  }
  sendTallySheet() {
    this.sendTallySheetFile.emit(this.availableFiles);
  }

  updateRowData(event: any) {
    this.rowDataFromTable = event;
    this.rowDataFromTableEvent.emit(this.rowDataFromTable);
  }
  fromErrorToInfo(event: any) {
    this.isProcessingData = event;
    this.wellTable.cleanTable();
  }

  @ViewChild('tallySheetFile') tallySheetButton: ButtonUploadComponent;
  @ViewChildren('availableFiles')
  availableFiles: QueryList<ButtonUploadComponent>;

  isProcessedData = false;
  isProcessingData = true;
  nameWell: string;
  idWell: number;
  errorList: any = [];
  idBusinessLineArray: any[] = [];
  elementsArray: any[] = [];
  errorItems: any[];
  userPipeSelected: string;
  nameList: string[] = [];

  async sendRowData(): Promise<void> {
    this.wellTable.stopEditing();
    if (!this.validateConditionsLocally()) {
      return;
    }
    let isValidSteppForm = true;
    if (isValidSteppForm) {
      const isDataWithoutErrors = await this.validateProcessingData();
      console.log('Ingreso en sendRowData');
      if (isDataWithoutErrors) {
        this.sharedService.currentRelease.subscribe((data: any) => {
          this.releaseDataSummaryProcessed = data;
        });
        this.sharedService.currentElement.subscribe((data: any) => {
          this.releaseInfo = data;
        });
        const dataToSend = {
          elemenRelease: this.releaseDataSummaryProcessed,
          release: this.releaseInfo,
        };
        console.log('dataToSend', dataToSend);
        this.logisticService.postSaveWellUploadedData(dataToSend).subscribe({
          next: (res: any) => {
            this.completedSteps[0] = true;
            this.updateCompletedSteps();
            this.sendNextData();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: SlbSeverity.Error,
              summary:
                'Problema en el almacenamiento de información despues de una transformación correcta',
              detail: error.error.messageError,
            });
          },
        });
      } else {
        let index = 0;
        this.errorItems = this.errorList.map((element: any) => {
          return {
            index: index++,
            viewText: element.description,
            value: element.idElement,
          };
        });

        this.isProcessingData = false;
      }
    }
  }

  private validateConditionsLocally(): boolean {
    const validConditions = new Set(this.standardConditions);
    const errors: string[] = [];

    for (let i = 0; i < this.rowDataFromTable.length; i++) {
      const row = this.rowDataFromTable[i];
      const trimmedValue = row.condition ? String(row.condition).trim() : null;

      if (!trimmedValue) {
        continue;
      }

      if (validConditions.has(trimmedValue)) {
        row.condition = trimmedValue;
      } else {
        const rowIndexForUser = i + 1;
        const errorMessage = `El valor '${row.condition}' en la fila ${rowIndexForUser} de la columna 'Condition' no es válido.`;
        errors.push(`<b>Fila ${rowIndexForUser}:</b> El valor '${row.condition}' no es válido.`);

        console.error('Error de validación:', errorMessage);
        alert('Error de validación: ' + errorMessage);
      }
    }
    if (errors.length > 0) {
      this.messageService.add({
        severity: SlbSeverity.Error,
        summary: 'Se encontraron datos inválidos',
        detail: errors.join('<br>'),
        asHtml: true,
      });
      return false;
    }
    return true;
  }

  async validateProcessingData(): Promise<boolean> {
    const filteredData = this.rowDataFromTable.filter(
      (row: { [s: string]: unknown } | ArrayLike<unknown>) =>
        Object.values(row).some(
          value => value !== null && value !== undefined && String(value).trim() !== ''
        )
    );

    let needMapping = this.loadFilesInformation.fieldMapping || false;
    if (!Array.isArray(needMapping)) {
      needMapping = false;
    }
    if (needMapping.length === 1) {
      needMapping = true;
    }

    let arrayWithMapping = filteredData;
    if (needMapping === true) {
      let tempArray = [];
      for (let i = 0; i < filteredData.length; i++) {
        const element = filteredData[i];
        const mapping = this.loadFilesInformation.fieldMapping[0];

        let tempObject: any = {};
        Object.keys(mapping).forEach(key => {
          const attributesList: any = mapping[key];
          let tempString = '';
          for (let j = 0; j < attributesList.length; j++) {
            const attribute = attributesList[j];
            if (attribute === ' ') {
              tempString = tempString + ' ';
            } else {
              tempString = tempString + element[attribute];
            }
          }
          tempObject[key] = tempString;
        });

        tempArray.push(tempObject);
      }
      arrayWithMapping = tempArray;
    }

    if (arrayWithMapping.length === 0) {
      this.messageService.add({
        severity: SlbSeverity.Warning,
        summary: 'No hay datos válidos para transformar.',
      });
      return false;
    }

    const obj = {
      idBusinessLine: this.loadFilesInformation.id,
      elements: arrayWithMapping,
    };

    try {
      const isCorrect = await this.checkProcessData(obj);
      if (isCorrect) {
        this.rowDataFromTable = [...this.errorList];
      }
      return isCorrect;
    } catch (error) {
      console.error('Error en validateProcessingData:', error);
      return false;
    }
  }

  validateAddInformation(): boolean {
    let alertMessages: string[] = [];
    this.availableFiles.forEach((availableFile, index) => {
      let fileInformation = this.loadFilesInformation.availableFiles[index];
      if (availableFile.files.length === 0 && fileInformation.required === true) {
        alertMessages.push(fileInformation.file);
      }
    });
    // this.availableFiles.forEach((availableFile) => {
    //   availableFile.underlineButton();
    // });
    const formattedFilesList =
      'Es necesario agregar:<ul>' +
      alertMessages.map(file => `<li>${file}</li>`).join('') +
      '</ul>';
    if (alertMessages.length !== 0) {
      this.messageService.add({
        severity: SlbSeverity.Warning,
        summary: formattedFilesList,
        asHtml: true,
      });
      return false;
    }

    // if (this.tallySheetButton.files.length === 0) {
    //   this.messageService.add({
    //     severity: SlbSeverity.Warning,
    //     summary: "Es necesario agregar el Tally Sheet",
    //   });
    //   return false;
    // }
    if (
      !this.rowDataFromTable.every((obj: any) =>
        Object.values(obj).every(value => value !== null && value !== undefined && value !== '')
      )
    ) {
      this.messageService.add({
        severity: SlbSeverity.Warning,
        summary: 'Todas las columnas deben llenarse',
      });
      return false;
    }
    if (
      !this.rowDataFromTable.every((obj: any) =>
        Object.values(obj).some(value => value !== null && value !== undefined && value !== '')
      )
    ) {
      this.messageService.add({
        severity: SlbSeverity.Warning,
        summary: 'Todas las columnas deben llenarse',
      });
      return false;
    }
    return true;
  }

  async checkProcessData(data: any): Promise<boolean> {
    console.log('Información enviada para análisis:', data);

    // Simulación de llamada a la API
    let response = await firstValueFrom(
      this.apiService.processWellData(
        environment.serverUrl + environment.endpoints.standardVerification.url,
        data,
        environment.endpoints.standardVerification.name
      )
    );
    // Actualizamos errorList y otros valores relevantes
    this.errorList = response.errorElements.map((element: any, index: number) => ({
      ...element,
      index: index,
    }));
    this.idBusinessLineArray = data.idBusinessLine;
    this.elementsArray = data.elements;

    console.log('Información recibida del análisis:', response);
    return response.isError;
  }

  selectionChangeDrop(event: any): void {
    this.cdRef.detectChanges();
    this.userPipeSelected = event.viewText;
  }

  downloadTemplate(): void {
    const link = document.createElement('a');
    console.log('link ', link);
    link.href = this.loadFilesInformation.template.uel; // La URL del archivo zip que quieres descargar
    link.download = this.loadFilesInformation.template.name; // Nombre con el que se descargará el archivo
    console.log('nombreArchivo', this.loadFilesInformation.template.name);
    console.log('linkDownload', link.href);

    link.click();
  }

  async onErrorListChange(updatedErrorList: any[]): Promise<void> {
    console.log('ErrorList recibido del hijo:', updatedErrorList);
    this.errorList = updatedErrorList;
    this.rowDataFromTable = [...this.errorList];
    const isValid = await this.validateProcessingData();
    this.sendRowData();
    console.log('Resultado de validateProcessingData después de actualizar:', isValid);
  }
}
