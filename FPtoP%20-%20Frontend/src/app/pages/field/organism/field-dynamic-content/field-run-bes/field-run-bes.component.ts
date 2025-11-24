import { ShowElementsInformationComponent } from './../../../../quality/rejected-approved-screens/show-elements-information/show-elements-information.component';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RunBesService, InterfaceRigTimeDetails } from '../../../services/run-bes.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CustomShayaHeaderIconComponent } from '../../../../../atoms/custom-shaya-header-icon/custom-shaya-header-icon.component';
import { toArray, forEach } from 'cypress/types/lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import {
  MessageService,
  SlbMessage,
  SlbMessagesComponent,
  SlbSeverity,
} from '@slb-dls/angular-material/notification';
import { MatDialog } from '@angular/material/dialog';
import { RejectDeleteDialogComponent } from 'src/app/shared/components/templates/reject-delete-dialog/reject-delete-dialog.component';
import { DoubleAskDialogComponent } from 'src/app/atoms/double-ask-dialog/double-ask-dialog.component';
import { NotificationsComponent } from 'src/app/pages/notifications/notifications.component';
import { DialogAdviceComponent } from 'src/app/shared/components/organism/dialog-advice/dialog-advice.component';
import { map } from 'rxjs/operators';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { UserInfo, UserService } from 'src/app/features/auth/services/user.service';
import { ObtainSheetsService } from 'src/app/services/obtain-sheets.service';
import { HttpClient } from '@angular/common/http';
import { GetDocumentsOfElementService } from 'src/app/services/get-documents-of-element.service';
import { PdfViewerDialogComponent } from 'src/app/organisms/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { FileUpload } from 'src/app/atoms/button-upload/button-upload.component';
import { UserGroup } from '../../../../../features/auth/auth.service';

interface profundidadesAsentamiento {
  //Profundidad de asentamiento
  topebodhmd: number;
  topebodhtvd: number;
  topeintakemd: number;
  topeintaketvd: number;
  topemotormd: number;
  topemotortvd: number;
  topeperforadosmd: number;
  topeperforadostvd: number;
  baseperforadosmd: number;
  baseperforadostvd: number;
  totalwelldepthmd: number;
  totalwelldepthtvd: number;
}
interface wellDetailsVarious {
  //Detalles de pozo/Varios
  maxdls: number;
  profundidad: number;
  dlsprofbomba: number;
  desviacionprofbomba: number;
  desviacionmaximaporatravesar: number;
  longitudequipoesp: number;
  longitudcable: number;
  longitudcablemle: number;
  longitudcapilarexterno: number;
}

interface DataRunBes {
  preparadopor: string;
  aprobadopor: string;
  liderinstalacion: string;
  companyman: string;
  iniciodeinstalacion: string;
  operador: string;
  pais: string;
  findeinstalacion: string;
  liderarranque: string;
  cliente: string;
  arranque: string;
  testigos: string;
  tipodeaplicacion: string;
  //idOilfieldOperations: number; //FK
}

interface InfoDataOperationDetails {
  idWell: string;
  wellName: string;
  wellShortName: string;
  field: string;
  country: string;
  client: string;
  initialProductionZone: string;
  idOilFieldOperations: string;
  idOilfieldTypeOperations: string;
  operationType: string;
  operationCode: string;
  operationNumber: string;
  idRig: string;
  rigName: string;
  rigEMR: string;
}

interface InfoUndergroundEquipmentDetails {
  idTally: number;
  idOilfieldOperations: number;
  element_id: number;
  idStandardElement: number;
  name: string;
  brand: string;
}

//Protectores de Cable
interface InfoCableProtectors {
  idOilfieldOperations: number;
  idRelease: number;
  idBusinessLine: string;
  timestamp: string;
  idReleaseState: string;
  idCreatedBy: string;
  changeReason: string;
  idElementRelease: string;
  serial: string;
  idCondition: string;
  condition: string;
  quantity: string;
  idCouplingCondition: string;
  brand: string;
  idStandardElements: string;
  pecDescription: string;
  approvalStatus: string;
}

//Encabezado Rig Time
interface InterfaceHeaderRig {
  cliente: string;
  liderInstalacion: string;
  representanteCliente: string;
}
//Informacion Trabajo
interface InterfaceWorkInformation {
  fechaHoraArriboLocacion: string;
  fechaHoraInicioTrabajo: string;
  fechaHoraFinTrabajo: string;
}

//Test N
type Row = {
  seccionId: number;
  seccion: string;
  elemento: string;
  attr: string;
  value: string;
  label: string;
};

interface TablaSeccion {
  seccion: string;
  headers: string[];
  rows: { elemento: string; values: { [key: string]: string }; label: string }[];
}

interface TablaSeccionConTemporales extends TablaSeccion {
  rowsTemporales: {
    elemento: string;
    values: { [key: string]: string };
    label: string;
  }[];
}

type FilaTemporal = {
  elemento: string;
  values: { [key: string]: string };
  label: string;
  idRunBesElementDetail?: number; // opcional, solo si ya existe en BD
};

//Test N

interface interfaceInfoDownholeBomb {
  idOilfieldOperation: number;
  idTally: number;
  idRelease: number;
  idElementRelease: number;
  idStandardElement: number;
  nameStandardElement: string;
  idElementTally: number;
  sequenceNumber: number;
  standardAttrName: string;
  StandardAttributeOption: string;
  idStandardGroup: number;
}

@Component({
  selector: 'field-run-bes',
  templateUrl: './field-run-bes.component.html',
  styleUrls: ['./field-run-bes.component.scss'],
})
export class AppFieldRunBesComponent {
  //Variables
  well: string;
  idDataRunBes: any;
  urlToSave: string =
    environment.serverUrl + environment.endpoints.fileManagement.fileUploadToOilfieldOperation.url;
  //user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  initialFiles: FileUpload[] = [];

  infoDataOperationDetails: InfoDataOperationDetails = {
    idWell: '',
    wellName: '',
    wellShortName: '',
    field: '',
    country: '',
    client: '',
    initialProductionZone: '',
    idOilFieldOperations: '',
    idOilfieldTypeOperations: '',
    operationType: '',
    operationCode: '',
    operationNumber: '',
    idRig: '',
    rigName: '',
    rigEMR: '',
  };

  infoDataRunBes: DataRunBes = {
    preparadopor: '',
    aprobadopor: '',
    liderinstalacion: '',
    companyman: '',
    // iniciodeinstalacion: new Date(),
    iniciodeinstalacion: '',
    operador: '',
    pais: '',
    findeinstalacion: '',
    liderarranque: '',
    cliente: '',
    arranque: '',
    testigos: '',
    tipodeaplicacion: '',
  };

  mechanicalDetails: any[] = [];
  infoEquipmBrand: InfoUndergroundEquipmentDetails;
  infoYToolBrand: InfoUndergroundEquipmentDetails;
  diametersCamisaCirculacion: any[] = [];
  diametersFlowCoupling: any[] = [];
  diametersNoGo: any[] = [];
  downholeHeaders: any[] = [];
  getInformationDownhole: any[] = [];
  informationDownholeCabezaDescarga: any[] = [];
  informationDownholeBomb: any[] = [];
  informationDownholeIntkSepGas: any[] = [];
  informationDownholeProtectors: any[] = [];
  informationDownholeMotors: any[] = [];
  informationDownholeSensors: any[] = [];
  informationDownholeTransferline: any[] = [];
  informationDownholeCable: any[] = [];
  informationDownholePenetrador: any[] = [];
  listTranspInformationDownhole: any[] = [];
  dataRunBesLoaded: any[] = [];
  dataRigTimeLoaded: any[] = [];
  dataLastRunBesState: any[] = [];
  filesDataRunBes: any[] = [];

  standardElementGroups: any[] = [];
  standardElementGroupsTranferline: any[] = [];
  standardElementGroupsCable: any[] = [];

  orderAttrCabezaDescarga = [
    'SERIE',
    'TIPO',
    'NO. SERIE',
    'NO. PARTE',
    'ROSCA',
    'METALURGIA',
    'CONDICION',
    'PROPIEDAD',
  ];
  orderAttrBombas = [
    'SERIE',
    'TIPO',
    '# ETAPAS',
    'NO. SERIE',
    'NO. PARTE',
    'DESCRIPCION',
    'ROTACION',
    'OBSERVACION',
    'CONDICION',
    'PROPIEDAD',
  ];
  orderAttrIntkSepGas = [
    'SERIE',
    'TIPO',
    'NO. SERIE',
    'NO. PARTE',
    'DESCRIPCION',
    'ROTACION',
    'OBSERVACION',
    'CONDICION',
    'PROPIEDAD',
  ];
  orderAttrMotor = [
    'SERIE',
    'DESCRIPCION',
    'W.C',
    'NO. SERIE',
    'NO. PARTE',
    'HP',
    'VOLTIOS',
    'AMPERAJE',
    'AISLAMIENTO F-T',
    'RESISTENCIA F-F',
    'ACEITE',
    'ROTACION',
    'OBSERVACION',
    'CONDICION',
    'PROPIEDAD',
  ];
  orderAttrSensorsTransferline = [
    'SERIE',
    'TIPO',
    'NO. SERIE',
    'NO. PARTE',
    'METALURGIA',
    'OBSERVACION',
    'CONDICION',
    'PROPIEDAD',
  ];
  orderAttrCable = [
    'TIPO',
    'VOLTAJE',
    'ARMADURA',
    'CALIBRE AWG',
    'CAPILAR',
    'AISLAMIENTO F-T',
    'RESISTENCIA F-F',
    'RL (DIAS)',
    'OBSERVACION',
    'CONDICION',
    'PROPIEDAD',
  ];
  orderAttrPenetrador = ['MARCA', 'SERIAL', 'ESTADO'];

  profundidadesAsentamiento: any[] = [
    { label: 'Tope/BODH', md: '', tvd: '' },
    { label: 'Tope/Intake', md: '', tvd: '' },
    { label: 'Tope/Motor', md: '', tvd: '' },
    { label: 'Tope perforados', md: '', tvd: '' },
    { label: 'Base perforados', md: '', tvd: '' },
    { label: 'Total Well Depth', md: '', tvd: '' },
  ];

  detallesPozo: any[] = [
    { label: 'Max DLS', value: '', unit: '' },
    { label: '@Profundidad', value: '', unit: 'ft(MD)' },
    { label: 'DLS @Prof.Bomba', value: '', unit: 'deg/100ft' },
    { label: 'Desviacion @Prof.Bomba', value: '', unit: 'deg' },
    { label: 'Desviacion minima por atravesar', value: '', unit: 'deg' },
    { label: 'Longitud Equipo ESP', value: '', unit: 'ft' },
    { label: 'EMR', value: '', unit: 'ft' },
    { label: 'Longitud Cable', value: '', unit: 'ft' },
    { label: 'Longitud Cable + MLE', value: '', unit: 'ft' },
    { label: 'Longitud Capilar Externo', value: '', unit: 'ft' },
  ];

  detallesPozo1 = this.detallesPozo.slice(0, 6);
  detallesPozo2 = this.detallesPozo.slice(6);

  accesoriosTuberia: any[] = [
    { label: 'Tipo de Cabezal', value: '', diameter: '' },
    { label: 'Camisa circulacion', value: '', diameter: '' },
    { label: 'Flow Coupling', value: '', diameter: '' },
    { label: 'No-go', value: '', diameter: '' },
  ];

  detalleTool: any[] = [
    { label: 'Marca', value: '' },
    { label: 'Tipo', value: '' },
    { label: 'Y-Tool P/N', value: '' },
    { label: 'Blanking Plug P/N', value: '' },
    { label: 'Bypass Tubing OD', value: '' },
    { label: 'Unidades de Bypass Tubing', value: '' },
    { label: 'Rosca Bypass Tubing', value: '' },
    { label: 'Bypass Clamps', value: '' },
  ];

  detalleTool1 = this.detalleTool.slice(0, 4);
  detalleTool2 = this.detalleTool.slice(4);

  equiposEspecificos: any[] = [
    { label: 'Completacion Dual', value: '' },
    { label: 'POD Hanger', value: '' },
    { label: 'POD Penetrator', value: '' },
    { label: 'POD Casing Size', value: '' },
    { label: 'Packer utilizado', value: '' },
    { label: 'Motor Shroud', value: '' },
  ];

  equiposEspecificos1 = this.equiposEspecificos.slice(0, 4);
  equiposEspecificos2 = this.equiposEspecificos.slice(4);

  //Parametros estaticos del Sensor y Arranque
  parametrosSensor: any[] = [
    { label: 'Inicial', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
    { label: 'Intermedia', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
    { label: 'Final', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
    { label: 'Controlador', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
    { label: 'Rotacion 1', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
    { label: 'Rotacion 0', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
    { label: 'Produccion', pi: '', pd: '', ti: '', tm: '', ff: '', ft: '', amp: '', hz: '' },
  ];

  //Equipo de superficie
  equipoSuperficie1: any[] = [
    { label: 'Modelo', genset: '', sot: '' },
    { label: 'No.Serie', genset: '', sot: '' },
    { label: 'No.Parte', genset: '', sot: '' },
    { label: 'KVA Rating', genset: '', sot: '' },
    { label: 'Pri. Volks', genset: '', sot: '' },
    { label: 'Propiedad', genset: '', sot: '' },
  ];

  equipoSuperficie2: any[] = [
    { label: 'Descripcion', vsd: '' },
    { label: 'No.Serie', vsd: '' },
    { label: 'No.Parte', vsd: '' },
    { label: 'KVA Rating', vsd: '' },
    { label: 'Pulsos', vsd: '' },
    { label: 'Propiedad', vsd: '' },
  ];

  equipoSuperficie3: any[] = [
    { label: 'Modelo', sut: '' },
    { label: 'No.Serie', sut: '' },
    { label: 'No.Parte', sut: '' },
    { label: 'KVA Rating', sut: '' },
    { label: 'Sec. Volts', sut: '' },
    { label: 'Propiedad', sut: '' },
  ];

  parametrosVariador1: any[] = [
    { label: 'T Motor Hi', value: '' },
    { label: 'T Intake Hi', value: '' },
    { label: 'Pd Hi', value: '' },
  ];

  parametrosVariador2: any[] = [
    { label: 'Frec Max', value: '' },
    { label: 'Frec Min', value: '' },
    { label: 'Frec Base', value: '' },
  ];

  parametrosVariador3: any[] = [
    { label: 'OL', value: '' },
    { label: 'UL', value: '' },
    { label: 'TAP/Voltaje', value: '' },
  ];

  parametrosPenetradorColgadorEstatico: any[] = [
    { label: 'Localizacion empalte sobre la descarga', value: '' },
    { label: 'Punto de inyeccion derecho', value: '' },
    { label: 'Punto de inyeccion izquierdo', value: '' },
  ];

  //test downhole
  tablasCabezaDescarga: TablaSeccion[] = [];
  tablasIntkSepGas: TablaSeccion[] = [];
  tablasProtectors: TablaSeccion[] = [];
  tablasMotors: TablaSeccion[] = [];
  tablasSensors: TablaSeccion[] = [];
  tablasTransferline: TablaSeccionConTemporales[] = [];
  tablasCable: TablaSeccionConTemporales[] = [];
  tablasPenetrador: TablaSeccion[] = [];
  tablas: TablaSeccion[] = [];
  tablas2: TablaSeccion[] = [];
  //test downhole

  observaciones: string = '';

  //Rig time
  rowsRigTime: InterfaceRigTimeDetails[] = [
    {
      cliente: '',
      liderInstalacion: '',
      representanteCliente: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      detalle: '',
      fechaHoraArriboLocacion: '',
      fechaHoraInicioTrabajo: '',
      fechaHoraFinTrabajo: '',
      duration: '',
      //id: 'null',
    },
  ];

  headerRig: InterfaceHeaderRig = {
    cliente: '',
    liderInstalacion: '',
    representanteCliente: '',
  };

  workInformation: InterfaceWorkInformation = {
    fechaHoraArriboLocacion: '',
    fechaHoraInicioTrabajo: '',
    fechaHoraFinTrabajo: '',
  };

  //Protectores de cable
  cableProtectors: any[] = [];
  protectolizers: any[] = [];
  bandas: any[] = [];
  lowProfile: any[] = [];
  lastRunBesStatedescripcion: string = '';
  idOilFieldOperationPath: number = 0;
  //Notification
  btnCreateUpdateState: String = '';
  btnNotificationState: boolean = false;
  btnFileState: boolean = false;
  labelcreateUpdateRb: String = '';
  labelnotifyRb: String = '';
  idNotificationTemplate: number = 0;
  btnFirstFileDownload: boolean = false;
  idFileSent: number = 0;
  uploadXslRunBes: boolean = true;

  cableProtectoresData: any = {
    protectolizers: { value: '' },
    bandas: { value: '' },
    lowprofile: { value: '' },
  };

  isGeneratingPDF = false;
  public user: UserInfo;
  private userService = inject(UserService);

  constructor(
    public runBesService: RunBesService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    public dialog: MatDialog,
    private http: HttpClient,
    private getDocumentsService: GetDocumentsOfElementService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.route.url.subscribe(url => {
        this.idOilFieldOperationPath = +url[1].path;
      });

      const isValid = await this.valueObservALSvalidation(this.idOilFieldOperationPath);

      if (!isValid) {
        this.errorALSvalidation();
      } else {
        this.userService.currentUser.subscribe(currentUser => {
          this.user = currentUser;
        });

        const standardElementGroupsData = await firstValueFrom(
          this.runBesService.getStandardElementGroups()
        );

        this.standardElementGroups = standardElementGroupsData || [];
        console.log({ standardElementGroups: this.standardElementGroups });

        this.standardElementGroupsTranferline = this.standardElementGroups.filter(
          e => e.idStandardGroups === 8 && ['CAPILAR DERECHO', 'CAPILAR IZQUIERDO'].includes(e.name)
        );

        this.standardElementGroupsCable = this.standardElementGroups.filter(
          e => e.idStandardGroups === 9
        );
        console.log({ standardElementGroupsCable: this.standardElementGroupsCable });

        const promiseDataOperationDetails = firstValueFrom(
          this.runBesService.getDataOperationDetails(this.idOilFieldOperationPath)
        );

        const getDataOperationDetails = async () => {
          const res = await promiseDataOperationDetails;
          this.infoDataOperationDetails = {
            idWell: res[0].idWell,
            wellName: res[0].wellName,
            wellShortName: res[0] == undefined ? '' : res[0].wellShortName,
            field: res[0].field,
            country: res[0].country,
            client: res[0].client,
            initialProductionZone: res[0].initialProductionZone,
            idOilFieldOperations: res[0].idOilFieldOperations,
            idOilfieldTypeOperations: res[0].idOilfieldTypeOperations,
            operationType: res[0].operationType,
            operationCode: res[0].operationCode,
            operationNumber: res[0].operationNumber,
            idRig: res[0].idRig,
            rigName: res[0].rigName,
            rigEMR: res[0].rigEMR,
          };
        };

        await getDataOperationDetails();

        const [dataRunBesLoadedTemp, dataRigTimeLoadedTemp, dataLastRunBesState] =
          await Promise.all([
            firstValueFrom(this.runBesService.getInformationRunBes(this.idOilFieldOperationPath)),
            firstValueFrom(this.runBesService.getInformationRigTime(this.idOilFieldOperationPath)),
            //firstValueFrom(this.runBesService.getLastRunBesState(this.idOilFieldOperationPath)),
            ,
          ]);

        this.dataRunBesLoaded = dataRunBesLoadedTemp || [];
        this.dataRigTimeLoaded = dataRigTimeLoadedTemp || [];

        await this.validateRunBesState();

        if (this.dataRunBesLoaded && this.dataRunBesLoaded.length > 0) {
          this.infoDataRunBes = {
            preparadopor: this.dataRunBesLoaded[0].preparadopor,
            aprobadopor: this.dataRunBesLoaded[0].aprobadopor,
            liderinstalacion: this.dataRunBesLoaded[0].liderinstalacion,
            companyman: this.dataRunBesLoaded[0].companyman,
            iniciodeinstalacion: new Date(this.dataRunBesLoaded[0].iniciodeinstalacion)
              .toISOString()
              .split('T')[0],
            operador: this.dataRunBesLoaded[0].operador,
            pais: this.dataRunBesLoaded[0].pais,
            findeinstalacion: new Date(this.dataRunBesLoaded[0].findeinstalacion)
              .toISOString()
              .split('T')[0],
            liderarranque: this.dataRunBesLoaded[0].liderarranque,
            cliente: this.dataRunBesLoaded[0].cliente,
            arranque: new Date(this.dataRunBesLoaded[0].arranque).toISOString().split('T')[0],
            testigos: this.dataRunBesLoaded[0].testigos,
            tipodeaplicacion: this.dataRunBesLoaded[0].tipodeaplicacion,
          };

          const mappingProfAsentam: Record<string, { md: any; tvd: any }> = {
            'Tope/BODH': {
              md: this.dataRunBesLoaded[0].topebodhmd,
              tvd: this.dataRunBesLoaded[0].topebodhtvd,
            },
            'Tope/Intake': {
              md: this.dataRunBesLoaded[0].topeintakemd,
              tvd: this.dataRunBesLoaded[0].topeintaketvd,
            },
            'Tope/Motor': {
              md: this.dataRunBesLoaded[0].topemotormd,
              tvd: this.dataRunBesLoaded[0].topemotortvd,
            },
            'Tope perforados': {
              md: this.dataRunBesLoaded[0].topeperforadosmd,
              tvd: this.dataRunBesLoaded[0].topeperforadostvd,
            },
            'Base perforados': {
              md: this.dataRunBesLoaded[0].baseperforadosmd,
              tvd: this.dataRunBesLoaded[0].baseperforadostvd,
            },
            'Total Well Depth': {
              md: this.dataRunBesLoaded[0].totalwelldepthmd,
              tvd: this.dataRunBesLoaded[0].totalwelldepthtvd,
            },
          };

          this.profundidadesAsentamiento.forEach(item => {
            const match = mappingProfAsentam[item.label];
            if (match) {
              item.md = match.md;
              item.tvd = match.tvd;
            }
          });

          // detallesPozo;
          const mappingdetallesPozo: Record<string, { value: any }> = {
            'Max DLS': { value: this.dataRunBesLoaded[0].maxdls },
            '@Profundidad': { value: this.dataRunBesLoaded[0].profundidad },
            'DLS @Prof.Bomba': { value: this.dataRunBesLoaded[0].dlsprofbomba },
            'Desviacion @Prof.Bomba': { value: this.dataRunBesLoaded[0].desviacionprofbomba },
            'Desviacion minima por atravesar': {
              value: this.dataRunBesLoaded[0].desviacionmaximaporatravesar,
            },
            'Longitud Equipo ESP': { value: this.dataRunBesLoaded[0].longitudequipoesp },
            EMR: { value: this.infoDataOperationDetails.rigEMR },
            'Longitud Cable': { value: this.dataRunBesLoaded[0].longitudcable },
            'Longitud Cable + MLE': { value: this.dataRunBesLoaded[0].longitudcablemle },
            'Longitud Capilar Externo': { value: this.dataRunBesLoaded[0].longitudcapilarexterno },
          };

          this.detallesPozo.forEach(item => {
            const match = mappingdetallesPozo[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          //accesorios tuberia accesoriosTuberia
          const mappingAccesTub: Record<string, { value: any; diameter: any }> = {
            'Camisa circulacion': {
              value: this.dataRunBesLoaded[0].camisacirculacion,
              diameter: this.dataRunBesLoaded[0].camisacirculaciondiametro,
            },
            'Flow Coupling': {
              value: this.dataRunBesLoaded[0].flowcoupling,
              diameter: this.dataRunBesLoaded[0].flowcouplingdiametro,
            },
            'No-go': {
              value: this.dataRunBesLoaded[0].slidingsleevenogo,
              diameter: this.dataRunBesLoaded[0].slidingsleevenogodiametro,
            },
          };

          this.accesoriosTuberia.forEach(item => {
            const match = mappingAccesTub[item.label];
            if (match) {
              item.value = match.value;
              item.diameter = match.diameter;
            }
          });

          //y-tool
          const mappingYTool: Record<string, { value: any }> = {
            Marca: { value: this.dataRunBesLoaded[0].ytoolmarca },
            Tipo: { value: this.dataRunBesLoaded[0].ytooltipo },
            'Y-Tool P/N': { value: this.dataRunBesLoaded[0].ytoolpn },
            'Blanking Plug P/N': { value: this.dataRunBesLoaded[0].ytoolblankingplugpn },
            'Bypass Tubing OD': { value: this.dataRunBesLoaded[0].ytoolbypasstubingod },
            'Unidades de Bypass Tubing': {
              value: this.dataRunBesLoaded[0].ytoolunidadesbypasstubing,
            },
            'Rosca Bypass Tubing': { value: this.dataRunBesLoaded[0].ytoolroscabypasstubing },
            'Bypass Clamps': { value: this.dataRunBesLoaded[0].ytoolbypassclamps },
          };

          this.detalleTool.forEach(item => {
            const match = mappingYTool[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          //equipos especificos
          const mappingEquipEsp: Record<string, { value: any }> = {
            'Completacion Dual': { value: this.dataRunBesLoaded[0].completaciondual },
            'POD Hanger': { value: this.dataRunBesLoaded[0].podhanger },
            'POD Penetrator': { value: this.dataRunBesLoaded[0].podpenetrator },
            'POD Casing Size': { value: this.dataRunBesLoaded[0].podcasingsize },
            'Packer utilizado': { value: this.dataRunBesLoaded[0].packerutilizado },
            'Motor Shroud': { value: this.dataRunBesLoaded[0].motorshroud },
          };
          this.equiposEspecificos.forEach(item => {
            const match = mappingEquipEsp[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          //penetrador y conectores
          const mappingPenetrador: Record<string, { value: any }> = {
            'Localizacion empalte sobre la descarga': {
              value: this.dataRunBesLoaded[0].localizacionempaltesobreladescarga,
            },
            'Punto de inyeccion derecho': {
              value: this.dataRunBesLoaded[0].puntodeinyeccionderecho,
            },
            'Punto de inyeccion izquierdo': {
              value: this.dataRunBesLoaded[0].puntodeinyeccionizquierdo,
            },
          };
          this.parametrosPenetradorColgadorEstatico.forEach(item => {
            const match = mappingPenetrador[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          //equipos especificos
          const mappingEquipSup1: Record<string, { genset: any; sot: any }> = {
            Modelo: {
              genset: this.dataRunBesLoaded[0].gensettablerodistmodelo,
              sot: this.dataRunBesLoaded[0].sdtshiftmodelo,
            },
            'No.Serie': {
              genset: this.dataRunBesLoaded[0].gensettablerodistnoserie,
              sot: this.dataRunBesLoaded[0].sdtshiftnoserie,
            },
            'No.Parte': {
              genset: this.dataRunBesLoaded[0].gensettablerodistparte,
              sot: this.dataRunBesLoaded[0].sdtshiftnoparte,
            },
            'KVA Rating': {
              genset: this.dataRunBesLoaded[0].gensettablerodistkvarating,
              sot: this.dataRunBesLoaded[0].sdtshiftkvarating,
            },
            'Pri. Volks': {
              genset: this.dataRunBesLoaded[0].gensettablerodistprivolts,
              sot: this.dataRunBesLoaded[0].sdtshiftprivolts,
            },
            Propiedad: {
              genset: this.dataRunBesLoaded[0].gensettablerodistpropiedad,
              sot: this.dataRunBesLoaded[0].sdtshiftpropiedad,
            },
          };
          this.equipoSuperficie1.forEach(item => {
            const match = mappingEquipSup1[item.label];
            if (match) {
              item.genset = match.genset;
              item.sot = match.sot;
            }
          });

          const mappingEquipSup2: Record<string, { vsd: any }> = {
            Descripcion: { vsd: this.dataRunBesLoaded[0].vsddescripcion },
            'No.Serie': { vsd: this.dataRunBesLoaded[0].vsdnoseri },
            'No.Parte': { vsd: this.dataRunBesLoaded[0].vsdnoparte },
            'KVA Rating': { vsd: this.dataRunBesLoaded[0].vsdkvarating },
            Pulsos: { vsd: this.dataRunBesLoaded[0].vsdpulsos },
            Propiedad: { vsd: this.dataRunBesLoaded[0].vsdpropiedad },
          };
          this.equipoSuperficie2.forEach(item => {
            const match = mappingEquipSup2[item.label];
            if (match) {
              item.vsd = match.vsd;
            }
          });

          const mappingEquipSup3: Record<string, { sut: any }> = {
            Modelo: { sut: this.dataRunBesLoaded[0].sutmodelo },
            'No.Serie': { sut: this.dataRunBesLoaded[0].sutnoserie },
            'No.Parte': { sut: this.dataRunBesLoaded[0].sutnoparte },
            'KVA Rating': { sut: this.dataRunBesLoaded[0].sutkvarating },
            'Sec. Volts': { sut: this.dataRunBesLoaded[0].sutsecvolts },
            Propiedad: { sut: this.dataRunBesLoaded[0].sutpropiedad },
          };
          this.equipoSuperficie3.forEach(item => {
            const match = mappingEquipSup3[item.label];
            if (match) {
              item.sut = match.sut;
            }
          });

          //parametros estaticos
          const mappingParamEst: Record<
            string,
            { pi: ''; pd: ''; ti: ''; tm: ''; ff: ''; ft: ''; amp: ''; hz: '' }
          > = {
            // parametrosSensor: any[] = [
            Inicial: {
              pi: this.dataRunBesLoaded[0].pruebamegadainicialpi,
              pd: this.dataRunBesLoaded[0].pruebamegadainicialpd,
              ti: this.dataRunBesLoaded[0].pruebamegadainicialti,
              tm: this.dataRunBesLoaded[0].pruebamegadainicialtm,
              ff: this.dataRunBesLoaded[0].pruebamegadainicialff,
              ft: this.dataRunBesLoaded[0].pruebamegadainicialft,
              amp: this.dataRunBesLoaded[0].pruebamegadainicialamp,
              hz: this.dataRunBesLoaded[0].pruebamegadainicialhz,
            },
            Intermedia: {
              pi: this.dataRunBesLoaded[0].pruebamegadaintermediapi,
              pd: this.dataRunBesLoaded[0].pruebamegadaintermediapd,
              ti: this.dataRunBesLoaded[0].pruebamegadaintermediati,
              tm: this.dataRunBesLoaded[0].pruebamegadaintermediatm,
              ff: this.dataRunBesLoaded[0].pruebamegadaintermediaff,
              ft: this.dataRunBesLoaded[0].pruebamegadaintermediaft,
              amp: this.dataRunBesLoaded[0].pruebamegadaintermediaamp,
              hz: this.dataRunBesLoaded[0].pruebamegadaintermediahz,
            },
            Final: {
              pi: this.dataRunBesLoaded[0].pruebamegadafinalpi,
              pd: this.dataRunBesLoaded[0].pruebamegadafinalpd,
              ti: this.dataRunBesLoaded[0].pruebamegadafinalti,
              tm: this.dataRunBesLoaded[0].pruebamegadafinaltm,
              ff: this.dataRunBesLoaded[0].pruebamegadafinalff,
              ft: this.dataRunBesLoaded[0].pruebamegadafinalft,
              amp: this.dataRunBesLoaded[0].pruebamegadafinalamp,
              hz: this.dataRunBesLoaded[0].pruebamegadafinalhz,
            },
            Controlador: {
              pi: this.dataRunBesLoaded[0].pruebaarranquecontroladorpi,
              pd: this.dataRunBesLoaded[0].pruebaarranquecontroladorpd,
              ti: this.dataRunBesLoaded[0].pruebaarranquecontroladorti,
              tm: this.dataRunBesLoaded[0].pruebaarranquecontroladortm,
              ff: this.dataRunBesLoaded[0].pruebaarranquecontroladorff,
              ft: this.dataRunBesLoaded[0].pruebaarranquecontroladorft,
              amp: this.dataRunBesLoaded[0].pruebaarranquecontroladoramp,
              hz: this.dataRunBesLoaded[0].pruebaarranquecontroladorhz,
            },
            'Rotacion 1': {
              pi: this.dataRunBesLoaded[0].pruebaarranquerotacion1pi,
              pd: this.dataRunBesLoaded[0].pruebaarranquerotacion1pd,
              ti: this.dataRunBesLoaded[0].pruebaarranquerotacion1ti,
              tm: this.dataRunBesLoaded[0].pruebaarranquerotacion1tm,
              ff: this.dataRunBesLoaded[0].pruebaarranquerotacion1ff,
              ft: this.dataRunBesLoaded[0].pruebaarranquerotacion1ft,
              amp: this.dataRunBesLoaded[0].pruebaarranquerotacion1amp,
              hz: this.dataRunBesLoaded[0].pruebaarranquerotacion1hz,
            },
            'Rotacion 0': {
              pi: this.dataRunBesLoaded[0].pruebaarranquerotacioncpi,
              pd: this.dataRunBesLoaded[0].pruebaarranquerotacioncpd,
              ti: this.dataRunBesLoaded[0].pruebaarranquerotacioncti,
              tm: this.dataRunBesLoaded[0].pruebaarranquerotacionctm,
              ff: this.dataRunBesLoaded[0].pruebaarranquerotacioncff,
              ft: this.dataRunBesLoaded[0].pruebaarranquerotacioncft,
              amp: this.dataRunBesLoaded[0].pruebaarranquerotacioncamp,
              hz: this.dataRunBesLoaded[0].pruebaarranquerotacionchz,
            },
            Produccion: {
              pi: this.dataRunBesLoaded[0].pruebaarranqueproduccionpi,
              pd: this.dataRunBesLoaded[0].pruebaarranqueproduccionpd,
              ti: this.dataRunBesLoaded[0].pruebaarranqueproduccionti,
              tm: this.dataRunBesLoaded[0].pruebaarranqueproducciontm,
              ff: this.dataRunBesLoaded[0].pruebaarranqueproduccionff,
              ft: this.dataRunBesLoaded[0].pruebaarranqueproduccionft,
              amp: this.dataRunBesLoaded[0].pruebaarranqueproduccionamp,
              hz: this.dataRunBesLoaded[0].pruebaarranqueproduccionhz,
            },
          };
          this.parametrosSensor.forEach(item => {
            const match = mappingParamEst[item.label];
            if (match) {
              (item.pi = match.pi),
                (item.pd = match.pd),
                (item.ti = match.ti),
                (item.tm = match.tm),
                (item.ff = match.ff),
                (item.ft = match.ft),
                (item.amp = match.amp),
                (item.hz = match.hz);
            }
          });

          const mappingParamVar1: Record<string, { value: any }> = {
            // parametrosVariador1: any[] = [
            'T Motor Hi': { value: this.dataRunBesLoaded[0].tmotorhi },
            'T Intake Hi': { value: this.dataRunBesLoaded[0].tintakehi },
            'Pd Hi': { value: this.dataRunBesLoaded[0].pdhi },
          };
          this.parametrosVariador1.forEach(item => {
            const match = mappingParamVar1[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          const mappingParamVar2: Record<string, { value: any }> = {
            // parametrosVariador2: any[] = [
            'Frec Max': { value: this.dataRunBesLoaded[0].frecmax },
            'Frec Min': { value: this.dataRunBesLoaded[0].frecmin },
            'Frec Base': { value: this.dataRunBesLoaded[0].frecbase },
          };
          this.parametrosVariador2.forEach(item => {
            const match = mappingParamVar2[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          const mappingParamVar3: Record<string, { value: any }> = {
            // parametrosVariador3: any[] = [
            OL: { value: this.dataRunBesLoaded[0].ol },
            UL: { value: this.dataRunBesLoaded[0].ul },
            'TAP/Voltaje': { value: this.dataRunBesLoaded[0].tapvoltaje },
          };
          this.parametrosVariador3.forEach(item => {
            const match = mappingParamVar3[item.label];
            if (match) {
              item.value = match.value;
            }
          });

          //observaciones
          this.observaciones = this.dataRunBesLoaded[0].observaciones;
          this.idDataRunBes = this.dataRunBesLoaded[0].id;
        } else {
          this.idDataRunBes = null;
        }

        //Si hay datos RigTime coloca el id
        if (this.dataRigTimeLoaded && this.dataRigTimeLoaded.length > 0) {
          this.rowsRigTime = this.dataRigTimeLoaded
            .sort(
              (a, b) =>
                new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime()
            )
            .map(item => ({
              cliente: item.cliente ?? '',
              liderInstalacion: item.liderInstalacion ?? '',
              representanteCliente: item.representanteCliente ?? '',
              fechaHoraInicio: this.formatForDatetimeLocal(item.fechaHoraInicio),
              fechaHoraFin: this.formatForDatetimeLocal(item.fechaHoraFin),
              detalle: item.detalle ?? '',
              fechaHoraArriboLocacion: this.formatForDatetimeLocal(item.fechaHoraArriboLocacion),
              fechaHoraInicioTrabajo: this.formatForDatetimeLocal(item.fechaHoraInicioTrabajo),
              fechaHoraFinTrabajo: this.formatForDatetimeLocal(item.fechaHoraFinTrabajo),
              // duration: '',
              id: item.id ?? null,
            }));

          this.workInformation = {
            fechaHoraArriboLocacion: this.formatForDatetimeLocal(
              this.dataRigTimeLoaded[0]?.fechaHoraArriboLocacion
            ),
            fechaHoraInicioTrabajo: this.formatForDatetimeLocal(
              this.dataRigTimeLoaded[0]?.fechaHoraInicioTrabajo
            ),
            fechaHoraFinTrabajo: this.formatForDatetimeLocal(
              this.dataRigTimeLoaded[0]?.fechaHoraFinTrabajo
            ),
          };
        }
        //Si hay datos RigTime coloca el id

        //Mechanical details
        const mechanicalDetailsTemp = await this.runBesService
          .getInfoMechanicalDetails(this.idOilFieldOperationPath)
          .toPromise();
        this.mechanicalDetails = mechanicalDetailsTemp || [];

        //Equip Brand
        const promiseDataEquipBrand = firstValueFrom(
          this.runBesService.getInfoUndergroundEquipDetails(this.idOilFieldOperationPath)
        );
        const getDataEquipBrand = async () => {
          const res = await promiseDataEquipBrand;
          this.infoEquipmBrand = {
            idTally: res[0] == undefined ? 0 : res[0].idTally,
            idOilfieldOperations: res[0] == undefined ? 0 : res[0].idOilfieldOperations,
            element_id: res[0] == undefined ? 0 : res[0].element_id,
            idStandardElement: res[0] == undefined ? 0 : res[0].idStandardElement,
            name: res[0] == undefined ? '' : res[0].name,
            brand: res[0] == undefined ? '' : res[0].brand,
          };
        };
        await getDataEquipBrand();

        //Diametros
        //Camisa de circulacion
        const diametersCamisaCirculacionTemp = await this.runBesService
          .getDiametersCamisaCirculacion()
          .toPromise();
        this.diametersCamisaCirculacion = diametersCamisaCirculacionTemp || [];

        //Flow coupling
        const diametersFlowCouplingTemp = await this.runBesService
          .getDiametersFlowCoupling()
          .toPromise();
        this.diametersFlowCoupling = diametersFlowCouplingTemp || [];

        //No-go
        const diametersNogoTemp = await this.runBesService.getDiametersNoGo().toPromise();
        this.diametersNoGo = diametersNogoTemp || [];

        //Y Tool Brand
        const promiseDataYToolBrand = firstValueFrom(
          this.runBesService.getYToolDetails(this.idOilFieldOperationPath)
        );
        const getDataYTolBrand = async () => {
          const res = await promiseDataYToolBrand;
          this.infoYToolBrand = {
            idTally: res[0] == undefined ? 0 : res[0].idTally,
            idOilfieldOperations: res[0] == undefined ? 0 : res[0].idOilfieldOperations,
            element_id: res[0] == undefined ? 0 : res[0].element_id,
            idStandardElement: res[0] == undefined ? 0 : res[0].idStandardElement,
            name: res[0] == undefined ? '' : res[0].name,
            brand: res[0] == undefined ? '' : res[0].brand,
          };
        };
        await getDataYTolBrand();

        //Protectores de Cable
        const cableProtectorsTemp = await this.runBesService
          .getInfoCableProtectors(this.idOilFieldOperationPath)
          .toPromise();
        this.cableProtectors = cableProtectorsTemp || [];

        //Protectolizers
        const protectolizersTemp = await this.runBesService
          .getInfoProtectolizers(this.idOilFieldOperationPath)
          .toPromise();
        this.protectolizers = protectolizersTemp || [];

        //Bandas
        const bandasTemp = await this.runBesService
          .getInfoBandas(this.idOilFieldOperationPath)
          .toPromise();
        this.bandas = bandasTemp || [];

        //Low Profile
        const lowProfileTemp = await this.runBesService
          .getInfoLowProfile(this.idOilFieldOperationPath)
          .toPromise();
        this.lowProfile = lowProfileTemp || [];

        //Cabeza de descarga
        const getInformationDownholeCabezaDescargaTemp = await this.runBesService
          .getInformationDownholeCabezaDescarga(this.idOilFieldOperationPath)
          .toPromise();
        this.informationDownholeCabezaDescarga = getInformationDownholeCabezaDescargaTemp || [];
        this.tablasCabezaDescarga = this.processTableCabezaDescarga(
          this.informationDownholeCabezaDescarga,
          this.orderAttrCabezaDescarga
        );
        if (!this.tablasCabezaDescarga || this.tablasCabezaDescarga.length === 0) {
          this.tablasCabezaDescarga = [
            {
              seccion: 'CABEZA DE DESCARGA / DISCHARGE PRESSURE SUB',
              headers: this.orderAttrCabezaDescarga,
              rows: [],
            },
          ];
        }

        // Bomb
        const getInformationDownholeBombTemp = await this.runBesService
          .getInformationDownholeBomb(this.idOilFieldOperationPath)
          .toPromise();
        let infoBomb = getInformationDownholeBombTemp || [];
        //Normalizar antes de procesar
        infoBomb = this.completarAtributosFaltantes(infoBomb, this.orderAttrBombas);
        this.informationDownholeBomb = getInformationDownholeBombTemp || [];
        this.informationDownholeBomb = infoBomb;
        if (this.informationDownholeBomb.length === 0) {
          this.tablas2 = [
            {
              seccion: 'BOMBAS / MANEJADORES DE GAS / POSEIDON',
              headers: this.orderAttrBombas,
              rows: [],
            },
          ];
        } else {
          this.procesarTablaBomb();
        }
        //Intake
        const getInformationDownholeIntkSepGasTemp = await this.runBesService
          .getInformationDownholeIntkSepGas(this.idOilFieldOperationPath)
          .toPromise();
        //Normalizar la información para completar columnas faltantes
        const infoIntkSepGas = this.completarAtributosFaltantes(
          getInformationDownholeIntkSepGasTemp || [],
          this.orderAttrIntkSepGas
        );
        this.informationDownholeIntkSepGas = infoIntkSepGas;
        // this.informationDownholeIntkSepGas = getInformationDownholeIntkSepGasTemp || [];
        this.tablasIntkSepGas = this.processTableCabezaDescarga(
          this.informationDownholeIntkSepGas,
          this.orderAttrIntkSepGas
        );
        if (!this.tablasIntkSepGas || this.tablasIntkSepGas.length === 0) {
          this.tablasIntkSepGas = [
            { seccion: 'INTAKE / SEPARADORES DE GAS', headers: this.orderAttrIntkSepGas, rows: [] },
          ];
        }

        //Protectors
        const getInformationDownholeProtectorsTemp = await this.runBesService
          .getInformationDownholeProtectors(this.idOilFieldOperationPath)
          .toPromise();

        //Normalizar la información para completar columnas faltantes
        const infoProtectors = this.completarAtributosFaltantes(
          getInformationDownholeProtectorsTemp || [],
          this.orderAttrIntkSepGas
        );
        this.tablasProtectors = infoProtectors;
        // this.informationDownholeProtectors = getInformationDownholeProtectorsTemp || [];
        // console.log({ informationDownholeProtectors: this.informationDownholeProtectors });
        this.tablasProtectors = this.processTableCabezaDescarga(
          this.informationDownholeProtectors,
          this.orderAttrIntkSepGas
        );
        if (!this.tablasProtectors || this.tablasProtectors.length === 0) {
          this.tablasProtectors = [
            { seccion: 'PROTECTORES', headers: this.orderAttrIntkSepGas, rows: [] },
          ];
        }
        // Asigna los labels según el valor de TIPO
        this.tablasProtectors.forEach(tabla => {
          tabla.rows.forEach(row => {
            const tipo = row.values?.TIPO || '';
            if (tipo.endsWith('UT')) {
              row.label = 'PROTECTOR SUPERIOR';
            } else if (tipo.endsWith('LT')) {
              row.label = 'PROTECTOR INFERIOR';
            } else {
              row.label = 'PROTECTOR';
            }
          });
        });

        //Motores
        const getInformationDownholeMotorsTemp = await this.runBesService
          .getInformationDownholeMotors(this.idOilFieldOperationPath)
          .toPromise();
        //Normalizar la información para completar columnas faltantes
        const infoMotors = this.completarAtributosFaltantes(
          getInformationDownholeMotorsTemp || [],
          this.orderAttrMotor
        );
        this.informationDownholeMotors = infoMotors;
        // this.informationDownholeMotors = getInformationDownholeMotorsTemp || [];
        this.tablasMotors = this.processTableCabezaDescarga(
          this.informationDownholeMotors,
          this.orderAttrMotor
        );
        if (!this.tablasMotors || this.tablasMotors.length === 0) {
          this.tablasMotors = [{ seccion: 'MOTORES', headers: this.orderAttrMotor, rows: [] }];
        }

        //Sensores
        const getInformationDownholeSensorsTemp = await this.runBesService
          .getInformationDownholeSensors(this.idOilFieldOperationPath)
          .toPromise();

        //Normalizar la información para completar columnas faltantes
        const infoSensors = this.completarAtributosFaltantes(
          getInformationDownholeSensorsTemp || [],
          this.orderAttrSensorsTransferline
        );
        this.informationDownholeSensors = infoSensors;

        // this.informationDownholeSensors = getInformationDownholeSensorsTemp || [];
        this.tablasSensors = this.processTableCabezaDescarga(
          this.informationDownholeSensors,
          this.orderAttrSensorsTransferline
        );
        if (!this.tablasSensors || this.tablasSensors.length === 0) {
          this.tablasSensors = [
            {
              seccion: 'SENSOR / ADICIONALES DE SENSOR TIPO 1 / CENTRALIZADOR',
              headers: this.orderAttrSensorsTransferline,
              rows: [],
            },
          ];
        }

        //Transferline
        const getInformationDownholeTransferlineTemp = await this.runBesService
          .getInformationDownholeTransferline(this.idOilFieldOperationPath)
          .toPromise();

        //Normalizar la información para completar columnas faltantes
        const infoTransferline = this.completarAtributosFaltantes(
          getInformationDownholeTransferlineTemp || [],
          this.orderAttrSensorsTransferline
        );
        this.informationDownholeTransferline = infoTransferline;

        // this.informationDownholeTransferline = getInformationDownholeTransferlineTemp || [];
        this.tablasTransferline = this.processTableCabezaDescarga(
          this.informationDownholeTransferline,
          this.orderAttrSensorsTransferline
        ).map(tabla => ({
          ...tabla,
          rowsTemporales: [],
        })) as TablaSeccionConTemporales[];
        if (!this.tablasTransferline || this.tablasTransferline.length === 0) {
          this.tablasTransferline = [
            {
              seccion: 'TRANSFERLINE / CAPILARES',
              headers: this.orderAttrSensorsTransferline,
              rows: [],
              rowsTemporales: [],
            },
          ];
        }

        const temporales = await this.runBesService
          .getRunBesElementDetailTemporals(this.idOilFieldOperationPath)
          .toPromise();

        if (temporales && temporales.length > 0) {
          const temporalesFiltrados = temporales.filter(t => t.idStandardGroups === 8);
          //console.log('temporalesTransferline', temporalesFiltrados);
          this.cargarTemporales(
            temporalesFiltrados,
            'TRANSFERLINE / CAPILARES',
            this.tablasTransferline
          );
        }
        //Transferline

        //Cable
        const getInformationDownholeCableTemp = await this.runBesService
          .getInformationDownholeCable(this.idOilFieldOperationPath)
          .toPromise();

        //Normalizar la información para completar columnas faltantes
        const infoCable = this.completarAtributosFaltantes(
          getInformationDownholeCableTemp || [],
          this.orderAttrCable
        );
        this.informationDownholeCable = infoCable;

        // this.informationDownholeCable = getInformationDownholeCableTemp || [];
        this.tablasCable = this.processTableCabezaDescarga(
          this.informationDownholeCable,
          this.orderAttrCable
        ).map(tabla => ({
          ...tabla,
          rowsTemporales: [],
          rows: tabla.rows.sort((a, b) => {
            const tipoA = a.values['TIPO'] === 'MLE' ? 1 : 0;
            const tipoB = b.values['TIPO'] === 'MLE' ? 1 : 0;
            return tipoA - tipoB; // MLE al final
          }),
        })) as TablaSeccionConTemporales[];

        if (!this.tablasCable || this.tablasCable.length === 0) {
          this.tablasCable = [
            {
              seccion: 'CABLE / EXTENSIONES DE MOTOR',
              headers: this.orderAttrCable,
              rows: [],
              rowsTemporales: [],
            },
          ];
        }
        const temporalesCable = await this.runBesService
          .getRunBesElementDetailTemporals(this.idOilFieldOperationPath)
          .toPromise();

        if (temporalesCable && temporalesCable.length > 0) {
          const temporalesFiltradosCable = temporalesCable.filter(t => t.idStandardGroups === 9);
          this.cargarTemporales(
            temporalesFiltradosCable,
            'CABLE / EXTENSIONES DE MOTOR',
            this.tablasCable
          );
          // this.cargarTemporales(temporales);
        }
        //Cable
        //Penetrador
        const getInformationDownholePenetradorTemp = await this.runBesService
          .getInformationDownholePenetrador(this.idOilFieldOperationPath)
          .toPromise();
        this.informationDownholePenetrador = getInformationDownholePenetradorTemp || [];
        this.tablasPenetrador = this.processTableCabezaDescarga(
          this.informationDownholePenetrador,
          this.orderAttrPenetrador
        );
        if (!this.tablasPenetrador || this.tablasPenetrador.length === 0) {
          this.tablasPenetrador = [
            {
              seccion: 'PENETRADOR Y CONECTORES EN COLGADOR',
              headers: this.orderAttrPenetrador,
              rows: [],
            },
          ];
        }
      }
    } catch (error) {
      console.error('Error to obtain data:', error);
    }
    // await this.loadInitialFile();
    // console.log('initial files', this.initialFiles);
  }

  isBlocked = false;

  errorALSvalidation() {
    this.isBlocked = true;
    const deletingMessage: SlbMessage = {
      target: 'toast',
      severity: SlbSeverity.Error,
      summary: 'Operacion no liberada!',
      detail: 'Aún no existe una liberación realizada por ALS, solicitalo que lo realicen.',
      life: 10000,
    };
    this.messageService.add(deletingMessage);
  }

  getDropdownList(label: string): { value: string }[] | null {
    const optionsMap: Record<string, { value: string }[]> = {
      'Camisa circulacion': this.diametersCamisaCirculacion,
      'Flow Coupling': this.diametersFlowCoupling,
      'No-go': this.diametersNoGo,
    };
    return optionsMap[label] || null;
  }

  dropdownOpen = false;
  newBombElement = '';

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  addRowMechanicalDetails(nameStandardElement: string): void {
    const idMapping: { [key: string]: number } = {
      Casing: 217,
      Tubing: 218,
      Liner: 220,
    };

    const newRow = {
      idStandardElements: idMapping[nameStandardElement] || null,
      nameStandardElement: nameStandardElement,
      topeMD: 0,
      fondoMD: 0,
      outerDiameter: 0,
      innerDiameter: 0,
      peso: 0,
      drift: 0,
      rosca: '',
      clase: '',
    };
    this.mechanicalDetails.push(newRow);
    this.dropdownOpen = false;
  }

  // Método para eliminar la última fila
  removeRow(): void {
    if (this.mechanicalDetails.length > 1) {
      this.mechanicalDetails.pop();
    }
  }

  drop(event: CdkDragDrop<any[]>, dataset: any[]) {
    moveItemInArray(dataset, event.previousIndex, event.currentIndex);
  }

  specialHeadersDowhole = [
    'PENETRADOR Y CONECTORES EN COLGADOR',
    'EQUIPO DE SUPERFICIE',
    'PARAMETROS ESTATICOS DEL SENSOR Y ARRANQUE',
    'PARAMETROS DEL VARIADOR Y TRANSFORMADOR',
  ];

  get normalDownholeHeaders() {
    return this.downholeHeaders.filter(
      header => !this.specialHeadersDowhole.includes(header.nameStandardGroup)
    );
  }

  specialHeaderDownholeLeft: any[] = [
    {
      nameStandardGroup: 'PENETRADOR Y CONECTORES EN COLGADOR',
    },
    {
      nameStandardGroup: 'PARAMETROS ESTATICOS DEL SENSOR Y ARRANQUE',
    },
  ];

  specialHeaderDownholeRight: any[] = [
    {
      nameStandardGroup: 'EQUIPO DE SUPERFICIE',
    },
    {
      nameStandardGroup: 'PARAMETROS DEL VARIADOR Y TRANSFORMADOR',
    },
  ];

  getHeaderDownholeClass(hederName: string) {
    const mapping: { [key: string]: string } = {
      'EQUIPO DE SUPERFICIE': 'header2',
      'PARAMETROS DEL VARIADOR Y TRANSFORMADOR': 'header4',
    };
    return mapping[hederName] || '';
  }

  //Create RUN BES DATA
  createRunBesData = async () => {
    if (!this.headerRig.cliente) {
      this.headerRig.cliente = this.infoDataOperationDetails.client;
    }

    if (!this.headerRig.liderInstalacion) {
      this.headerRig.liderInstalacion = this.infoDataRunBes.liderinstalacion;
    }

    const dataRunBes = {
      id: this.idDataRunBes,
      preparadopor: this.infoDataRunBes.preparadopor,
      aprobadopor: this.infoDataRunBes.aprobadopor,
      liderinstalacion: this.infoDataRunBes.liderinstalacion,
      companyman: this.infoDataRunBes.companyman,
      iniciodeinstalacion: this.infoDataRunBes.iniciodeinstalacion,
      operador: this.infoDataRunBes.operador,
      pais: this.infoDataOperationDetails.country,
      findeinstalacion: this.infoDataRunBes.findeinstalacion,
      liderarranque: this.infoDataRunBes.liderarranque,
      cliente: this.infoDataOperationDetails.client,
      arranque: this.infoDataRunBes.arranque,
      testigos: this.infoDataRunBes.testigos,
      tipodeaplicacion: this.infoDataRunBes.tipodeaplicacion,

      //Profundidades de asentamiento
      topebodhmd: +this.profundidadesAsentamiento[0].md || 0,
      topebodhtvd: +this.profundidadesAsentamiento[0].tvd || null,
      topeintakemd: +this.profundidadesAsentamiento[1].md || null,
      topeintaketvd: +this.profundidadesAsentamiento[1].tvd || null,
      topemotormd: +this.profundidadesAsentamiento[2].md || null,
      topemotortvd: +this.profundidadesAsentamiento[2].tvd || null,
      topeperforadosmd: +this.profundidadesAsentamiento[3].md || null,
      topeperforadostvd: +this.profundidadesAsentamiento[3].tvd || null,
      baseperforadosmd: +this.profundidadesAsentamiento[4].md || null,
      baseperforadostvd: +this.profundidadesAsentamiento[4].tvd || null,
      totalwelldepthmd: +this.profundidadesAsentamiento[5].md || null,
      totalwelldepthtvd: +this.profundidadesAsentamiento[5].tvd || null,
      //Detalle Pozo / Varios
      maxdls: +this.detallesPozo1[0].value || null,
      profundidad: +this.detallesPozo1[1].value || null,
      dlsprofbomba: +this.detallesPozo1[2].value || null,
      desviacionprofbomba: +this.detallesPozo1[3].value || null,
      desviacionmaximaporatravesar: +this.detallesPozo1[4].value || null,
      longitudequipoesp: +this.detallesPozo1[5].value || null,
      longitudcable: +this.detallesPozo2[1].value || null,
      longitudcablemle: +this.detallesPozo2[2].value || null,
      longitudcapilarexterno: +this.detallesPozo2[3].value || null,

      //Accesorios Tuberia
      camisacirculaciondiametro: this.accesoriosTuberia[1].diameter || null,
      camisacirculacion: this.accesoriosTuberia[1].value || null,
      flowcouplingdiametro: this.accesoriosTuberia[2].diameter || null,
      flowcoupling: this.accesoriosTuberia[2].value || null,
      slidingsleevenogodiametro: this.accesoriosTuberia[3].diameter || null,
      slidingsleevenogo: this.accesoriosTuberia[3].value || null,

      //YTool
      ytoolmarca: this.detalleTool1[0].value || null,
      ytooltipo: this.detalleTool1[1].value || null,
      ytoolpn: this.detalleTool1[2].value || null,
      ytoolblankingplugpn: this.detalleTool1[3].value || null,
      ytoolbypasstubingod: this.detalleTool2[0].value || null,
      ytoolunidadesbypasstubing: this.detalleTool2[1].value || null,
      ytoolroscabypasstubing: this.detalleTool2[2].value || null,
      ytoolbypassclamps: this.detalleTool2[3].value || null,

      //Protectores de cable
      protectolizers: this.cableProtectoresData.protectolizers[0] || null,
      bandas: this.cableProtectoresData.bandas[1] || null,
      lowprofile: this.cableProtectoresData.lowprofile[2] || null,

      //Equipos especificos
      completaciondual: this.equiposEspecificos1[0].value || null,
      podhanger: this.equiposEspecificos1[1].value || null,
      podpenetrator: this.equiposEspecificos1[2].value || null,
      podcasingsize: this.equiposEspecificos1[3].value || null,
      packerutilizado: this.equiposEspecificos2[0].value || null,
      motorshroud: this.equiposEspecificos2[1].value || null,

      //penetrador
      localizacionempaltesobreladescarga:
        this.parametrosPenetradorColgadorEstatico[0].value || null,
      puntodeinyeccionderecho: this.parametrosPenetradorColgadorEstatico[1].value || null,
      puntodeinyeccionizquierdo: this.parametrosPenetradorColgadorEstatico[2].value || null,

      //equipo de superficie
      gensettablerodistmodelo: this.equipoSuperficie1[0].genset || null,
      gensettablerodistnoserie: this.equipoSuperficie1[1].genset || null,
      gensettablerodistparte: this.equipoSuperficie1[2].genset || null,
      gensettablerodistkvarating: this.equipoSuperficie1[3].genset || null,
      gensettablerodistprivolts: this.equipoSuperficie1[4].genset || null,
      gensettablerodistpropiedad: this.equipoSuperficie1[5].genset || null,
      sdtshiftmodelo: this.equipoSuperficie1[0].sot || null,
      sdtshiftnoserie: this.equipoSuperficie1[1].sot || null,
      sdtshiftnoparte: this.equipoSuperficie1[2].sot || null,
      sdtshiftkvarating: this.equipoSuperficie1[3].sot || null,
      sdtshiftprivolts: this.equipoSuperficie1[4].sot || null,
      sdtshiftpropiedad: this.equipoSuperficie1[5].sot || null,
      vsddescripcion: this.equipoSuperficie2[0].vsd || null,
      vsdnoseri: this.equipoSuperficie2[1].vsd || null,
      vsdnoparte: this.equipoSuperficie2[2].vsd || null,
      vsdkvarating: this.equipoSuperficie2[3].vsd || null,
      vsdpulsos: this.equipoSuperficie2[4].vsd || null,
      vsdpropiedad: this.equipoSuperficie2[5].vsd || null,
      sutmodelo: this.equipoSuperficie3[0].vsd || null,
      sutnoserie: this.equipoSuperficie3[1].vsd || null,
      sutnoparte: this.equipoSuperficie3[2].vsd || null,
      sutkvarating: this.equipoSuperficie3[3].vsd || null,
      sutsecvolts: this.equipoSuperficie3[4].vsd || null,
      sutpropiedad: this.equipoSuperficie3[5].vsd || null,

      //Estaticos sensor
      pruebamegadainicialpi: this.parametrosSensor[0].pi || null,
      pruebamegadainicialpd: this.parametrosSensor[0].pd || null,
      pruebamegadainicialti: this.parametrosSensor[0].ti || null,
      pruebamegadainicialtm: this.parametrosSensor[0].tm || null,
      pruebamegadainicialff: this.parametrosSensor[0].ff || null,
      pruebamegadainicialft: this.parametrosSensor[0].ft || null,
      pruebamegadainicialamp: this.parametrosSensor[0].amp || null,
      pruebamegadainicialhz: this.parametrosSensor[0].hz || null,
      pruebamegadaintermediapi: this.parametrosSensor[1].pi || null,
      pruebamegadaintermediapd: this.parametrosSensor[1].pd || null,
      pruebamegadaintermediati: this.parametrosSensor[1].ti || null,
      pruebamegadaintermediatm: this.parametrosSensor[1].tm || null,
      pruebamegadaintermediaff: this.parametrosSensor[1].ff || null,
      pruebamegadaintermediaft: this.parametrosSensor[1].ft || null,
      pruebamegadaintermediaamp: this.parametrosSensor[1].amp || null,
      pruebamegadaintermediahz: this.parametrosSensor[1].hz || null,
      pruebamegadafinalpi: this.parametrosSensor[2].pi || null,
      pruebamegadafinalpd: this.parametrosSensor[2].pd || null,
      pruebamegadafinalti: this.parametrosSensor[2].ti || null,
      pruebamegadafinaltm: this.parametrosSensor[2].tm || null,
      pruebamegadafinalff: this.parametrosSensor[2].ff || null,
      pruebamegadafinalft: this.parametrosSensor[2].ft || null,
      pruebamegadafinalamp: this.parametrosSensor[2].amp || null,
      pruebamegadafinalhz: this.parametrosSensor[2].hz || null,
      pruebaarranquecontroladorpi: this.parametrosSensor[3].pi || null,
      pruebaarranquecontroladorpd: this.parametrosSensor[3].pd || null,
      pruebaarranquecontroladorti: this.parametrosSensor[3].ti || null,
      pruebaarranquecontroladortm: this.parametrosSensor[3].tm || null,
      pruebaarranquecontroladorff: this.parametrosSensor[3].ff || null,
      pruebaarranquecontroladorft: this.parametrosSensor[3].ft || null,
      pruebaarranquecontroladoramp: this.parametrosSensor[3].amp || null,
      pruebaarranquecontroladorhz: this.parametrosSensor[3].hz || null,
      pruebaarranquerotacion1pi: this.parametrosSensor[4].pi || null,
      pruebaarranquerotacion1pd: this.parametrosSensor[4].pd || null,
      pruebaarranquerotacion1ti: this.parametrosSensor[4].ti || null,
      pruebaarranquerotacion1tm: this.parametrosSensor[4].tm || null,
      pruebaarranquerotacion1ff: this.parametrosSensor[4].ff || null,
      pruebaarranquerotacion1ft: this.parametrosSensor[4].ft || null,
      pruebaarranquerotacion1amp: this.parametrosSensor[4].amp || null,
      pruebaarranquerotacion1hz: this.parametrosSensor[4].hz || null,
      pruebaarranquerotacioncpi: this.parametrosSensor[5].pi || null,
      pruebaarranquerotacioncpd: this.parametrosSensor[5].pd || null,
      pruebaarranquerotacioncti: this.parametrosSensor[5].ti || null,
      pruebaarranquerotacionctm: this.parametrosSensor[5].tm || null,
      pruebaarranquerotacioncff: this.parametrosSensor[5].ff || null,
      pruebaarranquerotacioncft: this.parametrosSensor[5].ft || null,
      pruebaarranquerotacioncamp: this.parametrosSensor[5].amp || null,
      pruebaarranquerotacionchz: this.parametrosSensor[5].hz || null,
      pruebaarranqueproduccionpi: this.parametrosSensor[6].pi || null,
      pruebaarranqueproduccionpd: this.parametrosSensor[6].pd || null,
      pruebaarranqueproduccionti: this.parametrosSensor[6].ti || null,
      pruebaarranqueproducciontm: this.parametrosSensor[6].tm || null,
      pruebaarranqueproduccionff: this.parametrosSensor[6].ff || null,
      pruebaarranqueproduccionft: this.parametrosSensor[6].ft || null,
      pruebaarranqueproduccionamp: this.parametrosSensor[6].amp || null,
      pruebaarranqueproduccionhz: this.parametrosSensor[6].hz || null,

      //Parametros variador
      tmotorhi: this.parametrosVariador1[0].value || null,
      tintakehi: this.parametrosVariador1[1].value || null,
      pdhi: this.parametrosVariador1[2].value || null,
      frecmax: this.parametrosVariador2[0].value || null,
      frecmin: this.parametrosVariador2[0].value || null,
      frecbase: this.parametrosVariador2[0].value || null,
      ol: this.parametrosVariador3[0].value || null,
      ul: this.parametrosVariador3[0].value || null,
      tapvoltaje: this.parametrosVariador3[0].value || null,

      observaciones: this.observaciones,
      initialproductionzone: this.infoDataOperationDetails.initialProductionZone,

      //Id operacion
      idOilfieldOperations: this.infoDataOperationDetails.idOilFieldOperations,
    };

    const detailsRigTime = this.rowsRigTime.map(r => ({
      cliente: this.headerRig.cliente,
      liderInstalacion: this.headerRig.liderInstalacion,
      representanteCliente: this.headerRig.representanteCliente,
      fechaHoraInicio: r.fechaHoraInicio,
      fechaHoraFin: r.fechaHoraFin,
      detalle: r.detalle,
      fechaHoraArriboLocacion: this.workInformation.fechaHoraArriboLocacion,
      fechaHoraInicioTrabajo: this.workInformation.fechaHoraInicioTrabajo,
      fechaHoraFinTrabajo: this.workInformation.fechaHoraFinTrabajo,
      id: r.id,
    }));

    const mechDetails = this.mechanicalDetails
      .filter(r => r.idStandardElements !== '')
      .map(r => ({
        id: r.idWellMechanical,
        topeMD: r.topeMD != null ? String(r.topeMD) : 0,
        fondoMD: r.fondoMD != null ? String(r.fondoMD) : 0,
        outerDiameter: r.outerDiameter != null ? String(r.outerDiameter) : 0,
        innerDiameter: r.innerDiameter != null ? String(r.innerDiameter) : 0,
        peso: r.peso != null ? String(r.peso) : 0,
        drift: r.drift != null ? String(r.drift) : 0,
        rosca: r.rosca != null ? String(r.rosca) : '',
        clase: r.clase != null ? String(r.clase) : '',
        //idOilfieldOperations: this.infoDataOperationDetails.idOilFieldOperations,
        idStandardElements: r.idStandardElements != null ? String(r.idStandardElements) : '',
      }));

    try {
      const res = await firstValueFrom(
        this.runBesService.createRunBesData(dataRunBes, detailsRigTime, mechDetails)
      );
      await this.saveAttributesFromMultipleTables(
        [this.tablasTransferline, this.tablasCable],
        this.idOilFieldOperationPath
      );

      const successMessage: SlbMessage = {
        target: 'toast',
        severity: SlbSeverity.Success,
        summary: '¡Datos enviados!',
        detail: 'Los datos se crearon o actualizaron correctamente.',
        life: 5000,
      };
      console.log('Datos enviados:', dataRunBes);
      this.messageService.add(successMessage);
      if (this.idDataRunBes == null) {
        const resRunBesState = await firstValueFrom(
          this.runBesService.createRunBesStateHistory(
            this.idOilFieldOperationPath,
            '',
            this.user.id,
            0,
            1,
            0
          )
        );
      }

      await this.validateRunBesState();
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000); // 2000 ms = 2 segundos
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  //Rig time
  calculateTime(start: string, end: string) {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs > 0 ? +(diffMs / (1000 * 60 * 60)).toFixed(2) : 0;
  }

  calculateTimeFormatted(start: string | Date, end: string | Date) {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '';
    }
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs <= 0) return '';
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
  }

  addRowRigTime(index?: number) {
    const nowISO = new Date().toISOString();
    const newRow = {
      cliente: '',
      liderInstalacion: '',
      representanteCliente: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      detalle: '',
      fechaHoraArriboLocacion: '',
      fechaHoraInicioTrabajo: '',
      fechaHoraFinTrabajo: '',
      duration: '',
    };
    if (index !== undefined) {
      this.rowsRigTime.splice(index + 1, 0, newRow);
    } else {
      this.rowsRigTime.push(newRow);
    }
  }

  deleteRowRigTime(index: number) {
    if (this.rowsRigTime.length > 1) {
      this.rowsRigTime.splice(index, 1);
    }
  }

  validateRowTime(index: number): boolean {
    const row = this.rowsRigTime[index];
    if (!row.fechaHoraInicio || !row.fechaHoraFin) return true;
    const start = new Date(row.fechaHoraInicio);
    const end = new Date(row.fechaHoraFin);
    // 1. Validar que la fecha final sea mayor que la inicial en la misma fila
    if (end <= start) {
      alert(`La hora final debe ser mayor que la inicial en la fila ${index + 1}`);
      row.fechaHoraFin = '';
      return false;
    }

    // 2. Validar contra la fila anterior SOLO si no es la primera
    if (index > 0) {
      const prevRow = this.rowsRigTime[index - 1];

      if (prevRow.fechaHoraFin) {
        const prevEnd = new Date(prevRow.fechaHoraFin);
        // Si el usuario está modificando algo y pone una fecha pasada
        if (start < prevEnd) {
          alert(
            `La hora de inicio de la fila ${index + 1} debe ser mayor que la hora final de la fila ${index}`
          );
          row.fechaHoraInicio = '';
          return false;
        }
      }
    }
    return true;
  }

  getTotalDuration() {
    let totalMinutes = 0;
    this.rowsRigTime.forEach(row => {
      if (row.fechaHoraInicio && row.fechaHoraFin) {
        const start = new Date(row.fechaHoraInicio);
        const end = new Date(row.fechaHoraFin);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);
        if (diff > 0) totalMinutes += diff;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours}h ${minutes}min`;
  }

  minStart(): string {
    if (!this.rowsRigTime.length) return '';
    const fechasConvertidas = this.rowsRigTime.map(f => new Date(f.fechaHoraInicio).getTime());
    const menor = new Date(Math.min(...fechasConvertidas));
    return menor.toLocaleString(); // o menor.toLocaleString(), según lo que necesites
  }

  // maxEndRig(): string {
  //   if (!this.rowsRigTime.length) return '';
  //   const fechasConvertidas = this.rowsRigTime.map(f => new Date(f.fechaHoraInicio).getTime());
  //   const menor = new Date(Math.min(...fechasConvertidas));
  //   return menor.toLocaleString(); // o menor.toLocaleString(), según lo que necesites
  // }

  get maxEnd(): string {
    const validEndDates = this.rowsRigTime
      .map(r => new Date(r.fechaHoraFin))
      .filter(d => !isNaN(d.getTime()));
    if (validEndDates.length === 0) return '--';
    const maxDate = new Date(Math.max(...validEndDates.map(d => d.getTime())));
    return maxDate.toLocaleString();
  }

  async valueObservALSvalidation(idOilFieldOperationPath: number) {
    const anyReleaseALSvalidation = await firstValueFrom(
      this.runBesService.getAnyReleaseALSvalidation(idOilFieldOperationPath)
    );
    if (anyReleaseALSvalidation.length > 0) {
      return true;
    }
    return false;
  }

  agruparPorSeccion(data: Row[]): TablaSeccion[] {
    const secciones: {
      [key: string]: {
        id: number;
        headers: Set<string>;
        rows: Map<string, { [key: string]: string }>;
      };
    } = {};

    for (const row of data) {
      if (!secciones[row.seccion]) {
        secciones[row.seccion] = {
          id: row.seccionId,
          headers: new Set(),
          rows: new Map(),
        };
      }

      const seccion = secciones[row.seccion];
      seccion.headers.add(row.attr);

      if (!seccion.rows.has(row.elemento)) {
        seccion.rows.set(row.elemento, {});
      }

      seccion.rows.get(row.elemento)![row.attr] = row.value;
    }

    return Object.entries(secciones)
      .sort(([, a], [, b]) => a.id - b.id)
      .map(([seccion, { headers, rows }]) => ({
        seccion,
        headers: Array.from(headers),
        // rows: Array.from(rows.entries()).map(([elemento, values]) => ({ elemento, values }))
        rows: Array.from(rows.entries()).map(([elemento, values]) => ({
          elemento: elemento.split('___')[1],
          values,
          label: '',
        })),
      }));
  }

  //Descargar documento
  async descargarPDFMultiple(ids: string[]) {
    this.isGeneratingPDF = true; // Mostrar indicador

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const elemento = document.getElementById(id);

      if (!elemento) {
        console.error(`No se encontró el elemento con id "${id}"`);
        continue;
      }

      const scrollable = elemento.querySelector('[style*="overflow-x"]') as HTMLElement;
      const originalWidth = scrollable?.style?.width || '';
      if (scrollable) {
        scrollable.style.width = scrollable.scrollWidth + 'px';
      }

      await new Promise<void>(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(elemento);
      const imgData = canvas.toDataURL('image/png');

      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      if (scrollable) {
        scrollable.style.width = originalWidth;
      }
    }

    pdf.save('RunBES_RigTime_Report.pdf');
    this.isGeneratingPDF = false; // Ocultar indicador
  }

  //Crear y subir documento xsl
  async createReportXslRunBesDB() {
    this.runBesService.generateXslRunBes(this.idOilFieldOperationPath);
  }

  reordenarFilas(event: CdkDragDrop<any[]>, tabla: TablaSeccion) {
    moveItemInArray(tabla.rows, event.previousIndex, event.currentIndex);
    this.actualizarLabels(tabla); // ← actualizar nombres después del movimiento
  }

  reordenarFilasNormal(event: CdkDragDrop<any[]>, tabla: TablaSeccion) {
    moveItemInArray(tabla.rows, event.previousIndex, event.currentIndex);
  }

  actualizarLabels(tabla: TablaSeccion): void {
    const total = tabla.rows.length;

    tabla.rows.forEach((row, index) => {
      if (index === 0) {
        row.label = `${row.elemento} SUPERIOR`;
      } else if (index === total - 1) {
        row.label = `${row.elemento} AGH/MGH`;
      } else {
        row.label = `${row.elemento} INTERMEDIO`;
      }
    });
  }

  //Notificaciones
  private notificationService = inject(NotificationsService);

  getFormattedTimestamp = () => {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  async onNotification(idTemplateNotification: number) {
    const dataToNotificate = {
      user: this.user.nameUser + ' | ' + this.user.email,
      updateDate: this.getFormattedTimestamp(),
      nameWell: this.infoDataOperationDetails.wellName,
      url: this.urlToSave,
      team: this.user.nameBusinessLine,
      // idStandardStates: 3,
      idStandardStates: idTemplateNotification,
    };

    this.notificationService.postNotification(dataToNotificate).subscribe({
      next: response => {
        console.log('Notification sent successfully');
      },
      error: error => {
        console.log('Error sending notification', error);
      },
      complete: () => {
        console.log('Notification request Completed');
      },
    });
    this.loadSignFlow(+this.infoDataOperationDetails.idOilFieldOperations);
  }

  processTableCabezaDescarga(informationDownhole: any[], orderAttr: string[]): TablaSeccion[] {
    const rowsCabeza: Row[] = informationDownhole
      .filter(
        item =>
          !(
            item.standardattributename === 'DESCRIPCION' &&
            [1, 7, 8].includes(item.idstandardgroups)
          )
      )
      .map(item => ({
        seccionId: item.idstandardgroups,
        seccion: item.standardgroups,
        elemento: `${item.idelementrelease}___${item.namestandardelement}`,
        attr: item.standardattributename,
        value: item.standardattributeoptions,
        label: '',
      }));
    let agrupados: TablaSeccion[] = this.agruparPorSeccion(rowsCabeza);

    agrupados = agrupados.map(seccion => {
      seccion.headers = seccion.headers.sort((a, b) => {
        const indexA = orderAttr.indexOf(a);
        const indexB = orderAttr.indexOf(b);
        return indexA - indexB;
      });
      seccion.rows = seccion.rows.map(row => {
        const newValues: { [key: string]: string } = {};
        seccion.headers.forEach(header => {
          newValues[header] = row.values[header];
        });
        return { ...row, values: newValues };
      });
      return seccion;
    });
    // this.tablasCabezaDescarga = agrupados;
    return agrupados;
  }

  procesarTablaBomb(): void {
    const grouped = new Map<
      number,
      {
        idelementrelease: number;
        sequence_number: number;
        seccionId: number;
        seccion: string;
        elemento: string;
        values: { [key: string]: string };
        label?: string;
      }
    >();

    this.informationDownholeBomb.forEach(item => {
      if (!grouped.has(item.idelementrelease)) {
        grouped.set(item.idelementrelease, {
          idelementrelease: item.idelementrelease,
          sequence_number: item.sequence_number,
          seccionId: item.idstandardgroups,
          seccion: item.standardgroups,
          elemento: `${item.idelementrelease}___${item.namestandardelement}`,
          values: {},
        });
      }
      grouped.get(item.idelementrelease)!.values[item.standardattributename] =
        item.standardattributeoptions;
    });

    const elementos = Array.from(grouped.values());

    if (elementos.length === 0) {
      this.tablas2 = [];
      return;
    }

    // Ordenar por sequence_number ASC para identificar min, penúltimo, max
    const secuencias = elementos.map(e => e.sequence_number).sort((a, b) => a - b);

    const min = secuencias[0];
    const max = secuencias[secuencias.length - 1];
    const penultimo =
      secuencias.length >= 4
        ? secuencias[secuencias.length - 2]
        : secuencias.length === 3
          ? secuencias[1]
          : null;
    console.log('min', min, 'MAX', max, 'penultimo', penultimo);

    elementos.forEach(e => {
      if (elementos.length === 1) {
        e.label = 'BOMBA SUPERIOR';
      } else if (e.sequence_number === min) {
        e.label = 'BOMBA SUPERIOR';
      } else if (e.sequence_number === max) {
        e.label = 'AGH/MGH';
      } else if (penultimo !== null && e.sequence_number === penultimo) {
        e.label = 'BOMBA INFERIOR';
      } else {
        e.label = 'BOMBA INTERMEDIA';
      }
    });

    const todosLosAtributos = new Set<string>();
    elementos.forEach(e => {
      Object.keys(e.values).forEach(attr => todosLosAtributos.add(attr));
    });

    const secciones = new Map<string, typeof elementos>();

    elementos.forEach(e => {
      if (!secciones.has(e.seccion)) {
        secciones.set(e.seccion, []);
      }
      secciones.get(e.seccion)!.push(e);
    });

    this.tablas2 = Array.from(secciones.entries()).map(([seccion, items]) => {
      const todosLosAtributos = new Set<string>();
      items.forEach(e => {
        Object.keys(e.values).forEach(attr => todosLosAtributos.add(attr));
      });

      const headers = this.orderAttrBombas.filter(attr => todosLosAtributos.has(attr));
      const extras = Array.from(todosLosAtributos).filter(
        attr => !this.orderAttrBombas.includes(attr)
      );
      const headersFinal = [...headers, ...extras];

      // Ordenar filas por label según preferencia para mostrar: Superior, Intermedia, Inferior, AGH
      const ordenPreferido = ['BOMBA SUPERIOR', 'BOMBA INTERMEDIA', 'BOMBA INFERIOR', 'AGH/MGH'];
      items.sort((a, b) => ordenPreferido.indexOf(a.label!) - ordenPreferido.indexOf(b.label!));

      return {
        seccion: seccion,
        headers: headersFinal,
        rows: items.map(e => ({
          elemento: e.elemento,
          values: e.values,
          label: e.label!,
        })),
      };
    });
  }

  formatForDatetimeLocal(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  flujoFirmas: any[] = [];
  permisos: any;
  plantillaNotificacion: number;
  idPasoActivoFirma: number;
  //Firmas notificacion
  loadSignFlow(idOilFieldOperation: number) {
    this.runBesService.getSignatureFlow(this.user.id, idOilFieldOperation).subscribe({
      next: result => {
        this.flujoFirmas = result.flujo;
        this.permisos = result.permisos;
        this.plantillaNotificacion = result.plantillaNotificacion;
        this.idPasoActivoFirma = result.idPasoActivo;
      },
      error: error => {
        console.log('Error al cargar flujo de firmas', error);
      },
    });
  }

  //Nuevas filas en las 3 ultimas secciones
  async agregarFilaTemporal(tabla: TablaSeccionConTemporales) {
    const groupRowId = crypto.randomUUID();
    const nuevaFila: { elemento: string; values: { [key: string]: string }; label: string } & {
      groupRowId: string;
    } = {
      elemento: '',
      values: {},
      label: '',
      groupRowId,
    };
    tabla.headers.forEach((header: string) => {
      nuevaFila.values[header] = '';
    });
    nuevaFila.values['LONGITUD'] = '';
    nuevaFila.values['PROFUNDIDAD'] = '';
    nuevaFila.values['CONDICION'] = '';
    nuevaFila.values['PROPIEDAD'] = '';
    nuevaFila.values['CARRETO'] = '';
    tabla.rowsTemporales.push(nuevaFila);
  }

  eliminarUltimaFilaTemporal(tabla: TablaSeccionConTemporales) {
    if (tabla.rowsTemporales.length > 0) {
      tabla.rowsTemporales.pop();
    }
  }

  crearPayload(tabla: TablaSeccionConTemporales, idRunBes: number) {
    const attributes: any[] = [];
    tabla.rowsTemporales.forEach(row => {
      const elementoGeneral = this.standardElementGroups.find(
        e => e.name.toUpperCase() === row.elemento.toUpperCase().trim()
      );
      if (!elementoGeneral) {
        console.warn('No se encontró en standardElementGroups:', row.elemento);
        return;
      }
      const idStandardElement = elementoGeneral.idStandardElements;
      Object.entries(row.values).forEach(([columna, valor]) => {
        attributes.push({
          idStandardElement,
          column: columna,
          value: valor,
          groupRowId: (row as any).groupRowId,
        });
      });
    });

    return { idRunBes, attributes };
  }

  async validateRunBesState() {
    const [dataLastRunBesState] = await Promise.all([
      firstValueFrom(this.runBesService.getLastRunBesState(this.idOilFieldOperationPath)),
      ,
    ]);

    this.dataLastRunBesState = dataLastRunBesState || [];
    //const lastRunBesState = this.dataLastRunBesState[0];

    this.lastRunBesStatedescripcion =
      this.dataLastRunBesState[0]?.descripcion === undefined
        ? 'Creation'
        : this.dataLastRunBesState[0]?.descripcion;

    switch (this.lastRunBesStatedescripcion) {
      case 'Creation':
        if (this.user.idBusinessLine === 1) {
          this.btnCreateUpdateState = 'Create';
          this.btnNotificationState = false;
          this.btnFileState = false;
          this.labelcreateUpdateRb = 'CREAR REPORTE';
        }
        break;
      case 'Draft':
        if (this.user.idBusinessLine === 1) {
          this.btnCreateUpdateState = 'Update';
          this.btnNotificationState = true;
          this.btnFileState = false;
          this.labelnotifyRb = 'NOTIFICAR ALS BASE 61';
          this.labelcreateUpdateRb = 'ACTUALIZAR REPORTE';
          this.idNotificationTemplate = 3;
          this.uploadXslRunBes = true;
        }
        break;
      case 'En revision ALS Base 61':
        if (this.user.idBusinessLine === 2) {
          this.btnCreateUpdateState = 'Update';
          this.btnNotificationState = true;
          this.btnFileState = true;
          this.labelnotifyRb = 'NOTIFICAR IWC';
          this.labelcreateUpdateRb = 'ACTUALIZAR REPORTE';
          this.idNotificationTemplate = 5;
          this.btnFirstFileDownload = true;
          this.idFileSent = 7;
          this.uploadXslRunBes = true;
        }
        break;
      /*  case 'En revision IWC':
        if (this.user.idBusinessLine === 5) {
          this.btnCreateUpdateState = '';
          this.btnNotificationState = true;
          this.btnFileState = true;
          this.labelnotifyRb = 'NOTIFICAR LEV SHAYA';
          this.idNotificationTemplate = 6;
          this.idFileSent = 6;
          this.uploadXslRunBes = true;
        }
        break;
      case 'En revision Levantamiento Shaya':
        if (this.user.idBusinessLine === 7) {
          this.btnCreateUpdateState = '';
          this.btnNotificationState = true;
          this.labelnotifyRb = 'NOTIFICAR LEV PEC';
          this.btnFileState = true;
          this.idFileSent = 9;
        }
        break;
      case 'En revision Levantamiento PEC':
        if (this.user.idBusinessLine === 7) {
          this.btnCreateUpdateState = '';
          this.btnNotificationState = false;
          this.btnFileState = true;
          this.labelnotifyRb = 'CARGAR ARCHIVO FINAL';
          this.idFileSent = 5;
        }
        break;*/
      case 'Aprobado':
        this.btnCreateUpdateState = '';
        this.btnNotificationState = false;
        this.btnFileState = false;
        break;

      default:
        this.btnCreateUpdateState;
        this.isBlocked = true;
        break;
    }
    const logValidation = {
      btnFileState: this.btnFileState,
      btnCreateUpdateState: this.btnCreateUpdateState,
      btnNotificationState: this.btnNotificationState,
      dataLastRunBesState: this.dataLastRunBesState[0],
      labelcreateUpdateRb: this.labelcreateUpdateRb,
      labelnotifyRb: this.labelnotifyRb,
      idNotificationTemplate: this.idNotificationTemplate,
      uploadXslRunBes: this.uploadXslRunBes,
      user: this.user,
    };
    console.log({ logValidation });
  }

  async testNotFunction() {
    this.onNotification(this.idNotificationTemplate);
    const resRunBesState = await firstValueFrom(
      this.runBesService.createRunBesStateHistory(
        this.idOilFieldOperationPath,
        '',
        this.user.id,
        this.dataLastRunBesState[0].idNewState,
        this.dataLastRunBesState[0].nextState,
        this.dataLastRunBesState[0].actualIdFile
      )
    );
    setTimeout(() => {
      window.location.reload();
    }, 2000); // 2000 ms = 2 segundos
  }

  /*
  async showFile() {
    let extension: string = '';
    const file: any = []; //= files[0];
    if (this.uploadXslRunBes) {
      // await this.createReportXslRunBesDB();
      // const filesReportRunBes = await firstValueFrom(
      //   this.runBesService.getFileRunBesReport(this.idOilFieldOperationPath)
      // );

      const filesReportRunBes = await firstValueFrom(
        this.runBesService.generateXslRunBes(this.idOilFieldOperationPath)
      );
      // const file = response.file;

      file.filePath = filesReportRunBes[0].filePath;
      file.idStoredFiles = filesReportRunBes[0].id;
      file.fileName = filesReportRunBes[0].fileName;
      extension = 'xlsx';
    } else {
      const files = await firstValueFrom(
        this.runBesService.getFileOilFieldOperation(this.idOilFieldOperationPath)
      );
      if (!files.length) {
        console.warn('No hay archivos para descargar');
        return;
      }
      extension = 'pdf';
    }

    this.getDocumentsService
      .getFileFromPath(file.filePath, file.idStoredFiles, file.fileName)
      .subscribe(blob => {
        const blobUrl = URL.createObjectURL(blob);
        if (file.fileName.toLowerCase().endsWith(extension)) {
          // console.log(file.fileName.toLowerCase());
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = file.fileName || 'archivo';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
        }
      });
  }
*/
  async showFile() {
    let extension = '';
    let file: any = {};
    console.log('this.uploadXslRunBes', this.uploadXslRunBes);
    try {
      if (this.uploadXslRunBes) {
        console.log("entrando nico");
        const filesReportRunBes = await firstValueFrom(
          this.runBesService.generateXslRunBes(this.idOilFieldOperationPath)
        );
        if (!filesReportRunBes?.length) {
          console.warn('No se devolvieron archivos del servidor.');
          return;
        }

        file = filesReportRunBes[0];
        extension = 'xlsx';
      } else {
        const files = await firstValueFrom(
          this.runBesService.getFileOilFieldOperation(this.idOilFieldOperationPath)
        );

        if (!files?.length) {
          console.warn('No hay archivos disponibles para descargar.');
          return;
        }

        file = files[0];
        extension = 'pdf';
      }

      // Validar datos del archivo
      if (!file.filePath || !file.fileName || !file.id) {
        console.error('Información incompleta del archivo:', file);
        const errorMessage: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Error,
          summary: '¡Issue con Reporte!',
          detail: 'No se pudo obtener la información del archivo.',
          life: 5000,
        };
        this.messageService.add(errorMessage);
        return;
      }

      // Descargar archivo
      this.getDocumentsService.getFileFromPath(file.filePath, file.id, file.fileName).subscribe({
        next: blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = file.fileName || 'archivo';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
          // this.toastr.success('Archivo descargado correctamente.');
        },
        error: err => {
          console.error('Error al descargar el archivo:', err);
          // this.toastr.error('No se pudo descargar el archivo.');
        },
      });
    } catch (error) {
      console.error('Error en showFile:', error);
      // this.toastr.error('Ocurrió un error al generar o descargar el archivo.');
    }
  }

  private cargarTemporales(
    temporales: any[],
    group: string,
    tablaSection: TablaSeccionConTemporales[]
  ) {
    type FilaTemporal = {
      elemento: string;
      values: { [key: string]: string };
      label: string;
      groupRowId: string;
    };
    const grupos = temporales.reduce(
      (acc: Record<string, FilaTemporal>, item: any) => {
        const key = item.groupRowId || `${item.rbed_idStandardElement}-default`;
        if (!acc[key]) {
          acc[key] = {
            elemento: item.StandardElementName || '',
            values: {},
            label: '',
            groupRowId: key,
          };
        }
        acc[key].values[item.StandardAttribute] = item.StandardAttributeOption || '';
        return acc;
      },
      {} as Record<string, FilaTemporal>
    );

    Object.values(grupos).forEach(filaTemp => {
      const tabla = tablaSection.find(t => t.seccion === group);
      if (tabla) {
        tabla.headers.forEach(header => {
          if (!(header in filaTemp.values)) filaTemp.values[header] = '';
        });
        filaTemp.values['CONDICION'] = filaTemp.values['CONDICION'] || '';
        filaTemp.values['PROPIEDAD'] = filaTemp.values['PROPIEDAD'] || '';
        filaTemp.values['LONGITUD'] = filaTemp.values['LONGITUD'] || '';
        filaTemp.values['CARRETO'] = filaTemp.values['CARRETO'] || '';
        filaTemp.values['PROFUNDIDAD'] = filaTemp.values['PROFUNDIDAD'] || '';

        tabla.rowsTemporales.push(filaTemp);
      }
    });
  }

  private async saveAttributesFromMultipleTables(
    tablasList: any[][],
    idRunBes: number
  ): Promise<void> {
    const allAttributes = tablasList.flatMap(tablas =>
      tablas.flatMap(tabla => this.crearPayload(tabla, idRunBes).attributes)
    );

    const payload = {
      idRunBes,
      attributes: allAttributes,
    };

    console.log({ payload: payload });
    await firstValueFrom(this.runBesService.insertRunBesElementDetail(payload));
  }

  completarAtributosFaltantes(lista: any[], columnasBase: string[]): any[] {
    if (!lista || lista.length === 0) return [];
    const grouped = new Map<number, any[]>();
    lista.forEach(item => {
      if (!grouped.has(item.idelementrelease)) grouped.set(item.idelementrelease, []);
      grouped.get(item.idelementrelease)!.push(item);
    });
    grouped.forEach((items, key) => {
      const existentes = items.map(i => i.standardattributename);
      const faltantes = columnasBase.filter(c => !existentes.includes(c));
      const base = items[0];
      faltantes.forEach(f => {
        items.push({
          ...base,
          standardattributename: f,
          standardattributeoptions: '',
        });
      });
    });
    return Array.from(grouped.values()).flat();
  }
}

