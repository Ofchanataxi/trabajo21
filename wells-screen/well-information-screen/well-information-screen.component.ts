import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import {
  ButtonUploadComponent,
  FileUpload,
} from 'src/app/atoms/button-upload/button-upload.component';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { ObtainSheetsService } from '../../../services/obtain-sheets.service';
import { UpdateReleaseStateService } from 'src/app/services/update-release-state.service';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { User } from 'src/app/features/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Subscription, switchMap } from 'rxjs';
import { UserInfo, UserService } from 'src/app/features/auth/services/user.service';
import { template } from 'cypress/types/lodash';
import { ApiService } from 'src/app/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-well-information-screen',
  templateUrl: './well-information-screen.component.html',
  styleUrls: ['./well-information-screen.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WellInformationScreenComponent implements OnInit, OnDestroy {
  constructor(
    public cdRef: ChangeDetectorRef,
    private route: ActivatedRoute, // Inyectar ActivatedRoute
    private obtainSheetsService: ObtainSheetsService,
    private updateReleaseStateService: UpdateReleaseStateService,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  private paramsSubscription: Subscription;
  private queryParamsSubscription: Subscription;
  private sharedData = inject(SharedDataService);
  public user: UserInfo;
  public selectedData: any[];
  private userSerivce = inject(UserService);
  private userSuscription: Subscription;
  public step: number;
  rowDataFromTable: Object[];
  releaseId: string;
  nameWell: string;
  public sheetsName: any[] = [];
  dataToTransform: any;
  sheetSelected: any;
  private isInitialLoadComplete = false;
  initialFilesForChild: (FileUpload & { idStandardFileTypesOfRelease: number })[] = [];
  public reloadedFileObject: File | null = null;
  public numberOfReleasesOfUserBusinessLine: number = 0;
  public availableOptionsOfReleases: { id: number; name: string }[] = [];
  private objectUrl: string | null = null;
  public mtcFileList: File[] = [];
  public initialMtcFiles: FileUpload[] = [];

  onSheetSelectedChange(newSheet: string) {
    this.sheetSelected = newSheet;
    console.log('Nueva hoja seleccionada en el padre:', this.sheetSelected);
  }

  bussinessLinesGuide: any = [
    {
      id: 1,
      idTypeOfRelease: 1,
      name: 'logistic',
      nameOfTypeOfRelease: 'Tally Sheet',
      instructionsText: `Usa la información que dispongas en el Tally Sheet para llenar la
        información. Recuerda: Si tienes más de 1 Tally Sheet para esta
        actividad, tendrás que repetir este proceso por cada uno de los Tally
        Sheet`,
      fieldsTable: [
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Junta # / Serial', name: 'serial', cellDataType: 'text' },
        { textToShow: 'Colada', name: 'heat', cellDataType: 'text' },
        { textToShow: 'OIT Inspección', name: 'oitInspection', cellDataType: 'text' },
        { textToShow: 'OIT Reparación', name: 'oitReparation', cellDataType: 'text' },
        { textToShow: 'Observaciones', name: 'observations', cellDataType: 'text' },
      ],
      // template: {
      //   required: true,
      //   url: 'blob:http://localhost:4100/dfcda36b-6f25-4197-8eed-b473dcfd75bc',
      //   name: 'Tally_Sheet_Template.xlsx',
      // },
      testDataList: [
        // {
        //   label: "Datos Correctos BC",
        //   data: [
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "NUEVO",
        //       quantity: 1,
        //       serial: "41493",
        //       heat: "38432",
        //       observation: "BISELADO",
        //     },
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "NUEVO",
        //       quantity: 3,
        //       serial: "4149333",
        //       heat: "3228432",
        //       observation: "BISELADO",
        //     },
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "INSPECCIONADO",
        //       quantity: 5,
        //       serial: "666",
        //       heat: "38435552",
        //       oitInspection: "66-SHY-2019",
        //       observation: "BISELADO",
        //     },
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "INSPECCIONADO-REPARADO",
        //       quantity: 5,
        //       serial: "666",
        //       heat: "38435552",
        //       oitInspection: "66-SHY-2019",
        //       oitReparation: "66-SHY-2019",
        //       observation: "BISELADO",
        //     },
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "NUEVO",
        //       quantity: 3,
        //       serial: "4149333",
        //       heat: "3228432",
        //       observation: "BISELADO",
        //     },
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "INSPECCIONADO-REPARADO",
        //       quantity: 5,
        //       serial: "666",
        //       heat: "38435552",
        //       oitInspection: "66-SHY-2019",
        //       oitReparation: "66-SHY-2019",
        //       observation: "BISELADO",
        //     },
        //     {
        //       description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //       condition: "INSPECCIONADO",
        //       quantity: 5,
        //       serial: "666",
        //       heat: "38435552",
        //       oitInspection: "66-SHY-2019",
        //       observation: "BISELADO",
        //     },
        //   ],
        // },
        // {
        //   label: "Error Test Data",
        //   data: [
        //       {
        //         description: "TUBING 3-2, PSL2, TSH BLUE, L-80 CR1, 9.2PPF",
        //         condition: "NUEVO",
        //         quantity: 1,
        //         serial: "41493",
        //         heat: "38432",
        //         oitInspection: "412-SHY-2019",
        //         oitReparation: "412-SHY-2019",
        //         observation: "BISELADO",
        //       },
        //       {
        //         description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //         condition: "NUEVO",
        //         quantity: 1,
        //         serial: "41493",
        //         heat: "38432",
        //         observation: "BISELADO",
        //       },
        //       {
        //         description: 'TUBING 3-1/2", PSL2, TSH BLUE, L-80, 9.2PPF',
        //         condition: "NUEVO",
        //         quantity: 3,
        //         serial: "4149333",
        //         heat: "3228432",
        //         observation: "BISELADO",
        //       },
        //       {
        //         description: 'X-OVER 3-1/2" TSH BLUE. PIN x 3-1/2" EU. PIN x 2FT, L-80',
        //         condition: "NUEVO",
        //         quantity: 1,
        //         serial: "41493",
        //         heat: "38432",
        //         oitInspection: "412-SHY-2019",
        //         oitReparation: "412-SHY-2019",
        //         observation: "BISELADO",
        //       },
        //   ],
        // },
        // {
        //   label: "Postman Data",
        //   data: [
        //     {
        //       "description": "TUBING 3-1/2\", PSL2, TSH BLUE, L-80 CR1, 9.2PPF",
        //       "condition": "NUEVO",
        //       "quantity": "1",
        //       "serial": "10114",
        //       "heat": "38431",
        //       "oitInspection": "",
        //       "oitReparation": "",
        //       "observation": "",
        //   },
        //   {
        //       "description": "TUBING 3-1/2\", PSL2, TSH BLUE, L-81 CR1, 9.2PPF",
        //       "condition": "NUEVO",
        //       "quantity": "2",
        //       "serial": "10115",
        //       "heat": "38431",
        //       "oitInspection": "088-SHY-2023-20F2586",
        //       "oitReparation": "'SHYC-2023-71",
        //       "observation": "",
        //   },
        //   {
        //       "description": "TUBING 3-1/2\", PSL2, TSH BLUE, L-80 CR2, 9.2PPF",
        //       "condition": "INSPECCIONADO",
        //       "quantity": "3",
        //       "serial": "10115",
        //       "heat": "38431",
        //       "oitInspection": "088-SHY-2023-20F2586",
        //       "oitReparation": "'SHYC-2023-71",
        //       "observation": "Biselado",
        //   },
        //   {
        //       "description": "CASING 7\",PSL2, TXP BTC, P-110, 29PPF",
        //       "condition": "NUEVO",
        //       "quantity": "3",
        //       "serial": "10115",
        //       "heat": "38431",
        //       "oitInspection": "088-SHY-2023-20F2586",
        //       "oitReparation": "'SHYC-2023-71",
        //       "observation": "Biselado",
        //   },
        //   {
        //       "description": "PUP JOINT 4-1/2\", TSH BLUE, L-80 CR1, 12.6PPF, 10FT",
        //       "condition": "NUEVO",
        //       "quantity": "3",
        //       "serial": "10115",
        //       "heat": "38431",
        //       "oitInspection": "088-SHY-2023-20F2586",
        //       "oitReparation": "'SHYC-2023-71",
        //       "observation": "Biselado",
        //   },
        //   {
        //       "description": "CROSSOVER 3-1/2\" TSH BLUE. PIN x 3-1/2\" EU. PIN x 2FT, L-80",
        //       "condition": "INSPECCIONADO-REPARADO",
        //       "quantity": "3",
        //       "serial": "10115",
        //       "heat": "38431",
        //       "oitInspection": "088-SHY-2023-20F2586",
        //       "oitReparation": "'SHYC-2023-71",
        //       "observation": "Biselado",
        //   },
        //   {
        //       "description": "CREADO 3-1/2\" TSH BLUE. PIN x 3-1/2\" EU. PIN x 2FT, L-80",
        //       "condition": "INSPECCIONADO-REPARADO",
        //       "quantity": "3",
        //       "serial": "10115",
        //       "heat": "38431",
        //       "oitInspection": "088-SHY-2023-20F2586",
        //       "oitReparation": "'SHYC-2023-71",
        //       "observation": "Biselado",
        //   },
        //   ],
        // },
      ],

      fileToTransform: [
        {
          id: 1,
          file: 'Tallysheet',
          required: true,
          extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          extensionToShow: 'Subir archivo excel',
          hasSign: false,
        },
      ],
      availableFiles: [
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: true,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Subir archivo pdf',
        //   hasSign: true,
        // },
      ],
      callbackAfterDelete: (response: any) => this.handleDeleteSuccess(response),
      callback: (response: any) => this.handleUploadSuccess(response, 'Tally Sheet cargado'),
    },
    {
      id: 1,
      idTypeOfRelease: 2,
      name: 'logistic',
      nameOfTypeOfRelease: 'Tally Tenaris',
      instructionsText: `Usa la información que dispongas en el Tally para llenar la
        información. Recuerda: Si tienes más de 1 Tally Sheet para esta
        actividad, tendrás que repetir este proceso por cada uno de los Tally`,
      fieldsTable: [
        { textToShow: 'Descripción Shaya', name: 'description', cellDataType: 'text' },
        { textToShow: 'Descripción Tenaris', name: 'descriptionTenaris', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Junta # / Serial', name: 'serial', cellDataType: 'text' },
        { textToShow: 'Colada', name: 'heat', cellDataType: 'text' },
        { textToShow: 'Steel Grade', name: 'Steel Grade', cellDataType: 'text' },
        { textToShow: 'Archivo MTC', name: 'mtcFilename', cellDataType: 'text' },
      ],
      // template: {
      //   required: true,
      //   url: 'blob:http://localhost:4100/dfcda36b-6f25-4197-8eed-b473dcfd75bc',
      //   name: 'Tally_Sheet_Template.xlsx',
      // },
      testDataList: [],

      fileToTransform: [
        {
          id: 1,
          file: 'file',
          required: true,
          extension: 'application/pdf',
          extensionToShow: 'Subir archivo pdf',
          hasSign: false,
        },
      ],
      availableFiles: [],
      callbackAfterDelete: async (response: any) => {
        console.log('Callback despues de borrar');
        this.sheetsName = [];
      },
      itpFiles: {
        NUEVO: [
          {
            id: 13,
            file: 'MTC de tenaris',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir MTCs',
            hasSign: false,
          },
        ],
      },
      callback: (response: any) => this.handleUploadSuccess(response, 'Tally Tenaris cargado'),
    },
    {
      id: 3,
      idTypeOfRelease: 1,
      name: 'completion',
      instructionsText: `Usa la información que dispones en el excel generado del ITP para llenar esta información, adicionalmente adjunta la información en formato PDF y EXCEL`,
      fieldsTable: [
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Número de parte', name: 'partNumber', cellDataType: 'text' },
        { textToShow: 'Número de serie', name: 'serial', cellDataType: 'text' },
      ],
      //template: {required: true,  url: './assets/tallySheetAlgunasPestanas.xlsx', name: 'Tally_Sheet_Template.xlsx'},
      testDataList: [
        // {
        //   label: 'Datos correctos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'NIPPLE, 2.75 IN x 3.5 IN 9.2PPF EUE BOX x PIN, 4140',
        //       quantity: 1,
        //       partNumber: 'N-6083192_SCC',
        //       serial: '45-OPS-005132 ( PRIMARIO )',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'NIPPLE, 2.75 IN x 3.5 IN 9.2PPF EUE BOX x PIN, 4140',
        //       quantity: 1,
        //       partNumber: 'N-6083192_SCC',
        //       serial: '08-OPS-006430 ( BACK UP )',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'STANDING VALVE 2.75" TYPE R SEAL BORE ,4340',
        //       quantity: 1,
        //       partNumber: 'T-6058125',
        //       serial: 'SV5-24075 ( PRIMARIO )',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'STANDING VALVE 2.75" TYPE R SEAL BORE ,4340',
        //       quantity: 1,
        //       partNumber: 'T-6058125',
        //       serial: 'SV5-24099 ( BACK UP )',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'STANDING VALVE 2.75" TYPE R SEAL BORE ,4340',
        //       quantity: 1,
        //       partNumber: '30511407000006DB',
        //       serial: '99233-99249-8',
        //       heat: 'SO: 364654 HT: 923869',
        //     },
        //   ],
        // },
      ],
      fileToTransform: [],
      availableFiles: [
        // {
        //   id: 3,
        //   file: 'ITP',
        //   required: true,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
      ],
      itpFiles: {
        NUEVO: [
          {
            id: 8,
            file: 'ITP para elementos NUEVOS - firmado por Completions',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
        INSPECCIONADO: [
          {
            id: 9,
            file: 'ITP para elementos INSPECCIONADOS - firmado por Completions',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
        'INSPECCIONADO-REPARADO': [
          {
            id: 10,
            file: 'ITP de Inspección - firmado por Completions',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
          {
            id: 11,
            file: 'ITP de reparación - firmado por Completions',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
      },
      callback: (response: any) =>
        this.handleUploadSuccess(response, 'Archivos de completion subidos'),
    },
    {
      id: 2,
      idTypeOfRelease: 1,
      name: 'als',
      nameOfTypeOfRelease: 'Equipos de Fondo',
      instructionsText: `Usa la información que dispones en el excel generado del ITP para llenar esta información, adicionalmente adjunta la información en formato PDF y EXCEL. Por último agrega los archivos de Excel del FER y el BOD`,
      fieldsTable: [
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Número de serie', name: 'serial', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Número de parte', name: 'partNumber', cellDataType: 'text' },
        { textToShow: 'Observaciones', name: 'observations', cellDataType: 'text' },
      ],
      // template: {required: true,  url: './assets/tallySheetAlgunasPestanas.xlsx', name: 'Tally_Sheet_Template.xlsx'},
      testDataList: [
        // {
        //   label: 'Datos correctos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON RE S RLOY AS AFL HL GRB MAX 280 HP 3226.2 V 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: BPBSL UT RLOY AFL MAX INC 718 ADVANCED ARZ TT HD NTB/RTB',
        //       quantity: 1,
        //       serial: '104597517-SN163',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CR CT AFL INC 718 ARZ TT RLOY FACT SHIM 117 STG',
        //       quantity: 1,
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos por completar',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON-RE-S-RLOY-AS-AFL-HL-GRB-MAX 280 HP / 3226.2 V / 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: BPBSL-UT-RLOY-AFL-MAX-INC 718- ADVANCED-ARZ-TT-HD-NTB/RTB',
        //       quantity: 1,
        //       serial: '104597517-SN163',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: LSBSB-LT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-NTB/RTB',
        //       quantity: 1,
        //       serial: '104611777-SN85',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN36',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN37',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN38',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MGH RC D5-20 CR-CT-RLOY-BTHD-INC-FBH-TT-FACT SHIM  / 27 STG',
        //       quantity: 1,
        //       serial: '103217639-SN376',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description:
        //         'SEPARADOR DE GAS VGSA D20-60 RLOY-INC-ES-TT-INC 718-EXTD HEAD-FACT SHIM',
        //       quantity: 1,
        //       serial: '101736912-SN872',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'BASE GAUGE: XT-150 TYPE 1',
        //       quantity: 1,
        //       serial: 'SN470',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 281,
        //       serial: '',
        //       observation: '3500-A-13 (REPARADO) - CANNON',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 36,
        //       serial: '',
        //       observation: 'UMC 3-1/2 F16-19/60 (REPARADO) - UMC',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 150,
        //       serial: '',
        //       observation: '3-1/2"-CF19X56 (REPARADO) - HYDRAHEAD',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 1,
        //       serial: '',
        //       observation: 'SOK-35-25X56 F0123-31 (NUEVO) - KONDA',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MID JOINT',
        //       quantity: 196,
        //       serial: '',
        //       observation: 'SOK-3 1/2-MJ-25X56-D0524-56 (NUEVO) - KONDA',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'MID JOINT',
        //       quantity: 170,
        //       serial: '',
        //       observation: '3500-C-13 (REPARADO) - CANNON',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MLE: 456 MAXLOK',
        //       quantity: 1,
        //       serial: '1000717371',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: '4/1 ELB G5F WT 3/8',
        //       quantity: 1200,
        //       serial: '4513120',
        //       observation: 'CNOE-014 | RL: 2069',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 4/1 ELB G5F WT 3/8',
        //       quantity: 810,
        //       serial: '4633960',
        //       observation: 'CNOE-014 | RL: 2016',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 4/1 ELB G5F WT 3/8',
        //       quantity: 3640,
        //       serial: '2607774',
        //       observation: 'YCAC-037 | RL: 2035',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 2/1 ELC G5F WT 3/8',
        //       quantity: 4910,
        //       serial: '3156150',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CAPILAR EXTERNO',
        //       quantity: 10750,
        //       serial: '',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'BODH - 3 1/2" EUE - 400',
        //       quantity: 1,
        //       serial: 'SIPATL2722416',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'CENTRALIZADOR MULTIPUNTO',
        //       quantity: 1,
        //       serial: 'SIPATL2852413',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       partNumber: '30511407000006DB',
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
      ],
      fileToTransform: [
        // {
        //   id: 1,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 2,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
        // {
        //   id: 3,
        //   file: "FER",
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        //   },
        // {
        //   id: 4,
        //   file: 'FER',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 5,
        //   file: 'BOD',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
        // {
        //   id: 6,
        //   file: 'BOD',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
      ],
      availableFiles: [
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
      ],
      itpFiles: {
        NUEVO: [
          {
            id: 13,
            file: 'ITP para elementos NUEVOS - firmado por ALS',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
      },
      callback: (response: any) => this.handleUploadSuccess(response, 'Equipos de fondo subidos'),
    },
    {
      id: 2,
      idTypeOfRelease: 2, // PROTECTORES NUEVOS
      name: 'als',
      nameOfTypeOfRelease: 'Protectores Nuevos',
      instructionsText: `Usa la información que dispones en el excel generado del ITP para llenar esta información, adicionalmente adjunta la información en formato PDF y EXCEL. Por último agrega los archivos de Excel del FER y el BOD`,
      fieldsTable: [
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Número de serie/modelo', name: 'modelo', cellDataType: 'text' },
        { textToShow: 'Número de lote', name: 'serial', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Fabricante', name: 'brand', cellDataType: 'text' },
      ],
      fieldMapping: [
        {
          quantity: ['quantity'],
          description: ['description', ' ', 'modelo'],
          serial: ['serial'],
          condition: ['condition'],
          brand: ['brand'],
        },
      ],
      // template: {required: true,  url: './assets/tallySheetAlgunasPestanas.xlsx', name: 'Tally_Sheet_Template.xlsx'},
      testDataList: [
        // {
        //   label: 'Datos correctos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON RE S RLOY AS AFL HL GRB MAX 280 HP 3226.2 V 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: BPBSL UT RLOY AFL MAX INC 718 ADVANCED ARZ TT HD NTB/RTB',
        //       quantity: 1,
        //       serial: '104597517-SN163',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CR CT AFL INC 718 ARZ TT RLOY FACT SHIM 117 STG',
        //       quantity: 1,
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos por completar',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON-RE-S-RLOY-AS-AFL-HL-GRB-MAX 280 HP / 3226.2 V / 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: BPBSL-UT-RLOY-AFL-MAX-INC 718- ADVANCED-ARZ-TT-HD-NTB/RTB',
        //       quantity: 1,
        //       serial: '104597517-SN163',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: LSBSB-LT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-NTB/RTB',
        //       quantity: 1,
        //       serial: '104611777-SN85',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN36',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN37',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN38',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MGH RC D5-20 CR-CT-RLOY-BTHD-INC-FBH-TT-FACT SHIM  / 27 STG',
        //       quantity: 1,
        //       serial: '103217639-SN376',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description:
        //         'SEPARADOR DE GAS VGSA D20-60 RLOY-INC-ES-TT-INC 718-EXTD HEAD-FACT SHIM',
        //       quantity: 1,
        //       serial: '101736912-SN872',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'BASE GAUGE: XT-150 TYPE 1',
        //       quantity: 1,
        //       serial: 'SN470',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 281,
        //       serial: '',
        //       observation: '3500-A-13 (REPARADO) - CANNON',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 36,
        //       serial: '',
        //       observation: 'UMC 3-1/2 F16-19/60 (REPARADO) - UMC',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 150,
        //       serial: '',
        //       observation: '3-1/2"-CF19X56 (REPARADO) - HYDRAHEAD',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 1,
        //       serial: '',
        //       observation: 'SOK-35-25X56 F0123-31 (NUEVO) - KONDA',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MID JOINT',
        //       quantity: 196,
        //       serial: '',
        //       observation: 'SOK-3 1/2-MJ-25X56-D0524-56 (NUEVO) - KONDA',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'MID JOINT',
        //       quantity: 170,
        //       serial: '',
        //       observation: '3500-C-13 (REPARADO) - CANNON',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MLE: 456 MAXLOK',
        //       quantity: 1,
        //       serial: '1000717371',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: '4/1 ELB G5F WT 3/8',
        //       quantity: 1200,
        //       serial: '4513120',
        //       observation: 'CNOE-014 | RL: 2069',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 4/1 ELB G5F WT 3/8',
        //       quantity: 810,
        //       serial: '4633960',
        //       observation: 'CNOE-014 | RL: 2016',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 4/1 ELB G5F WT 3/8',
        //       quantity: 3640,
        //       serial: '2607774',
        //       observation: 'YCAC-037 | RL: 2035',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 2/1 ELC G5F WT 3/8',
        //       quantity: 4910,
        //       serial: '3156150',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CAPILAR EXTERNO',
        //       quantity: 10750,
        //       serial: '',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'BODH - 3 1/2" EUE - 400',
        //       quantity: 1,
        //       serial: 'SIPATL2722416',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'CENTRALIZADOR MULTIPUNTO',
        //       quantity: 1,
        //       serial: 'SIPATL2852413',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       partNumber: '30511407000006DB',
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
      ],
      fileToTransform: [
        // {
        //   id: 1,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 2,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
        // {
        //   id: 3,
        //   file: "FER",
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        //   },
        // {
        //   id: 4,
        //   file: 'FER',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 5,
        //   file: 'BOD',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
        // {
        //   id: 6,
        //   file: 'BOD',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
      ],
      availableFiles: [
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
      ],
      callback: (response: any) =>
        this.handleUploadSuccess(response, 'Protectores Nuevos cargados'),
      itpFiles: {
        NUEVO: [
          {
            id: 13,
            file: 'ITP para elementos NUEVOS - firmado por ALS',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
      },
    },
    {
      id: 2,
      idTypeOfRelease: 3, // PROTECTORES REPARADOS
      name: 'als',
      nameOfTypeOfRelease: 'Protectores Reparados',
      instructionsText: `Usa la información que dispones en el excel generado del ITP para llenar esta información, adicionalmente adjunta la información en formato PDF y EXCEL. Por último agrega los archivos de Excel del FER y el BOD`,
      fieldsTable: [
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Fabricante', name: 'brand', cellDataType: 'text' },
      ],
      // template: {required: true,  url: './assets/tallySheetAlgunasPestanas.xlsx', name: 'Tally_Sheet_Template.xlsx'},
      testDataList: [
        // {
        //   label: 'Datos correctos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON RE S RLOY AS AFL HL GRB MAX 280 HP 3226.2 V 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: BPBSL UT RLOY AFL MAX INC 718 ADVANCED ARZ TT HD NTB/RTB',
        //       quantity: 1,
        //       serial: '104597517-SN163',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CR CT AFL INC 718 ARZ TT RLOY FACT SHIM 117 STG',
        //       quantity: 1,
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos por completar',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON-RE-S-RLOY-AS-AFL-HL-GRB-MAX 280 HP / 3226.2 V / 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: BPBSL-UT-RLOY-AFL-MAX-INC 718- ADVANCED-ARZ-TT-HD-NTB/RTB',
        //       quantity: 1,
        //       serial: '104597517-SN163',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTOR: LSBSB-LT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-NTB/RTB',
        //       quantity: 1,
        //       serial: '104611777-SN85',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN36',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN37',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-FBH-TT-RLOY-MOD CR -FACT SHIM / 97 STG',
        //       quantity: 1,
        //       serial: '103195632-SN38',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MGH RC D5-20 CR-CT-RLOY-BTHD-INC-FBH-TT-FACT SHIM  / 27 STG',
        //       quantity: 1,
        //       serial: '103217639-SN376',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description:
        //         'SEPARADOR DE GAS VGSA D20-60 RLOY-INC-ES-TT-INC 718-EXTD HEAD-FACT SHIM',
        //       quantity: 1,
        //       serial: '101736912-SN872',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'BASE GAUGE: XT-150 TYPE 1',
        //       quantity: 1,
        //       serial: 'SN470',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 281,
        //       serial: '',
        //       observation: '3500-A-13 (REPARADO) - CANNON',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 36,
        //       serial: '',
        //       observation: 'UMC 3-1/2 F16-19/60 (REPARADO) - UMC',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 150,
        //       serial: '',
        //       observation: '3-1/2"-CF19X56 (REPARADO) - HYDRAHEAD',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'PROTECTORES DE CABLE',
        //       quantity: 1,
        //       serial: '',
        //       observation: 'SOK-35-25X56 F0123-31 (NUEVO) - KONDA',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MID JOINT',
        //       quantity: 196,
        //       serial: '',
        //       observation: 'SOK-3 1/2-MJ-25X56-D0524-56 (NUEVO) - KONDA',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'MID JOINT',
        //       quantity: 170,
        //       serial: '',
        //       observation: '3500-C-13 (REPARADO) - CANNON',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'MLE: 456 MAXLOK',
        //       quantity: 1,
        //       serial: '1000717371',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: '4/1 ELB G5F WT 3/8',
        //       quantity: 1200,
        //       serial: '4513120',
        //       observation: 'CNOE-014 | RL: 2069',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 4/1 ELB G5F WT 3/8',
        //       quantity: 810,
        //       serial: '4633960',
        //       observation: 'CNOE-014 | RL: 2016',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 4/1 ELB G5F WT 3/8',
        //       quantity: 3640,
        //       serial: '2607774',
        //       observation: 'YCAC-037 | RL: 2035',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CABLE 2/1 ELC G5F WT 3/8',
        //       quantity: 4910,
        //       serial: '3156150',
        //       observation: '',
        //     },
        //     {
        //       condition: 'INSPECCIONADO-REPARADO',
        //       description: 'CAPILAR EXTERNO',
        //       quantity: 10750,
        //       serial: '',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'BODH - 3 1/2" EUE - 400',
        //       quantity: 1,
        //       serial: 'SIPATL2722416',
        //       observation: '',
        //     },
        //     {
        //       condition: 'NUEVO',
        //       description: 'CENTRALIZADOR MULTIPUNTO',
        //       quantity: 1,
        //       serial: 'SIPATL2852413',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       partNumber: '30511407000006DB',
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
      ],
      fileToTransform: [
        // {
        //   id: 1,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 2,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
        // {
        //   id: 3,
        //   file: "FER",
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        //   },
        // {
        //   id: 4,
        //   file: 'FER',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 5,
        //   file: 'BOD',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
        // {
        //   id: 6,
        //   file: 'BOD',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
      ],
      availableFiles: [
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
      ],
      itpFiles: {
        NUEVO: [
          {
            id: 13,
            file: 'ITP para elementos NUEVOS - firmado por ALS',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
      },
      callback: (response: any) =>
        this.handleUploadSuccess(response, 'Protectores Reparados cargados'),
    },
    {
      id: 2,
      idTypeOfRelease: 4, // ELEMENTOS ADICIONALES
      name: 'als',
      nameOfTypeOfRelease: 'Elementos Adicionales',
      instructionsText: `Usa la información que dispones para llenar la información`,
      fieldsTable: [
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Número de serie', name: 'serial', cellDataType: 'text' },
      ],
      // template: {required: true,  url: './assets/tallySheetAlgunasPestanas.xlsx', name: 'Tally_Sheet_Template.xlsx'},
      testDataList: [
        // {
        //   label: 'Datos correctos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON RE S RLOY AS AFL HL GRB MAX 280 HP 3226.2 V 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos por completar',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'MOTOR: EON-RE-S-RLOY-AS-AFL-HL-GRB-MAX 280 HP / 3226.2 V / 52.85 A',
        //       quantity: 1,
        //       serial: '103678823-SN11',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos',
        //   data: [
        //     {
        //       condition: 'NUEVO',
        //       description: 'PUMP: DN1750S CRCT-AFL-INC 718-ARZ-TT-RLOY-MOD CR -FACT SHIM / 117 STG',
        //       quantity: 1,
        //       partNumber: '30511407000006DB',
        //       serial: '103155344-SN7118',
        //       observation: '',
        //     },
        //   ],
        // },
      ],
      fileToTransform: [
        // {
        //   id: 1,
        //   file: 'ITP',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
      ],
      availableFiles: [
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
      ],
      callback: (response: any) =>
        this.handleUploadSuccess(response, 'Elementos Adicionales cargados'),
      // itpFiles: {
      //   NUEVO: [
      //     // {
      //     //   id: 13,
      //     //   file: 'ITP para elementos NUEVOS - firmado por ALS',
      //     //   required: true,
      //     //   extension: 'application/pdf',
      //     //   extensionToShow: 'Subir archivo pdf',
      //     //   hasSign: true,
      //     // },
      //   ],
      // },
    },
    {
      id: 2,
      idTypeOfRelease: 5, //Equipos de superficie
      name: 'als',
      nameOfTypeOfRelease: 'Equipos de superficie',
      instructionsText: `Adjunta la información en formato PDF.`,
      fieldsTable: [
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Número de serie', name: 'serial', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Observaciones', name: 'observations', cellDataType: 'text' },
      ],
      // template: {required: true,  url: './assets/tallySheetAlgunasPestanas.xlsx', name: 'Tally_Sheet_Template.xlsx'},
      testDataList: [],
      fileToTransform: [],
      availableFiles: [],

      callback: async (response: any) => {
        console.log('Se termino de subir los archivos de completion');
      },
      itpFiles: {
        NUEVO: [
          {
            id: 13,
            file: 'ITP para equipos de superficie NUEVOS - firmado por ALS',
            required: true,
            extension: 'application/pdf',
            extensionToShow: 'Subir archivo pdf',
            hasSign: true,
          },
        ],
      },
    },
    {
      id: 4,
      idTypeOfRelease: 1,
      name: 'Wellheads',
      instructionsText: `Usa la información que dispones en el excel del packing list generado del ITP para llenar esta información, adicionalmente adjunta la información en formato PDF y EXCEL.`,
      fieldsTable: [
        { textToShow: 'Cantidad', name: 'quantity', cellDataType: 'text' },
        { textToShow: 'Descripción', name: 'description', cellDataType: 'text' },
        { textToShow: 'Junta # / Serial', name: 'serial', cellDataType: 'text' },
        { textToShow: 'Marca', name: 'brand', cellDataType: 'text' },
        { textToShow: 'Condición', name: 'condition', cellDataType: 'text' },
        { textToShow: 'Observaciones', name: 'observations', cellDataType: 'text' },
      ],
      //template: {required: true,  url: './assets/templatePackingListSeccionC.xlsx', name: 'SeccionC_Template.xlsx'},
      testDataList: [
        // {
        //   label: 'Datos correctos',
        //   data: [
        //     {
        //       quantity: 1,
        //       description: 'MASTER-GATE-VALVE 3 1/8" 5000 PSI',
        //       serial: '144663',
        //       brand: '---',
        //       condition: 'INSPECCIONADO-REPARADO',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'WING-GATE-VALVE 3 1/8" 5000 PSI',
        //       serial: '144687',
        //       brand: '---',
        //       condition: 'INSPECCIONADO-REPARADO',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'SWAB-GATE-VALVE 3 1/8" 5000 PSI',
        //       serial: '144679',
        //       brand: '---',
        //       condition: 'INSPECCIONADO-REPARADO',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description:
        //         'MANDREL TUBING HANGER 11" NOM, EXCENTRIC 3 1/2" EU TOP , 3" BPV,  3 1/2" EU  BOTTOM,  2 1/4" UN,  2 3/8" NPT DD, P-U, PSL 1, PR 1',
        //       serial: 'MP000467-12',
        //       brand: 'MINGA',
        //       condition: 'NUEVO',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos correctos reparación ',
        //   data: [
        //     {
        //       quantity: 1,
        //       description:
        //         'SECCION C 13-5/8" 5000 PSI x 3-1/8" 5000 PSI, PSL1, PR1, P-U, DD, API 6A',
        //       serial: '123123',
        //       brand: 'MP',
        //       condition: 'inspeccionado-reparado',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'MASTERGATEVALVE 3 1/8" 5000 PSI EE, P-U, PSL 2, PR 1',
        //       serial: '176058',
        //       brand: 'V.W',
        //       condition: 'inspeccionado-reparado',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'WINGGATEVALVE 3 1/8" 5000 PSI EE, P-U, PSL 2, PR 1',
        //       serial: '176050',
        //       brand: 'V.W',
        //       condition: 'inspeccionado-reparado',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'SWABGATEVALVE 3 1/8" 5000 PSI EE, P-U, PSL 2, PR 1',
        //       serial: '176057',
        //       brand: 'V.W',
        //       condition: 'inspeccionado-reparado',
        //       observation: '',
        //     },
        //     // {
        //     //   description: 'TREE CAP 3 1/8" 5000 PSI DD, P-U, PSL 2',
        //     //   condition: "REPARADO",
        //     //   serial: "3231",
        //     //   heat: "223",
        //     //   brand: "Cameron",
        //     // },
        //     // {
        //     //   description: 'CROSS 3 1/8" 5000 PSI DD, P-U, PSL 2, PR 1',
        //     //   condition: "REPARADO",
        //     //   serial: "321",
        //     //   heat: "4432",
        //     //   brand: "Cameron",
        //     // },
        //     // {
        //     //   description: 'BLIND FLANGE 3 1/8" 5000 PSI DD, P-U, PSL 2',
        //     //   condition: "REPARADO",
        //     //   serial: "1123",
        //     //   heat: "4423",
        //     //   brand: "Cameron",
        //     // }
        //   ],
        // },
        // {
        //   label: 'Datos correctos hunger ',
        //   data: [
        //     {
        //       quantity: 1,
        //       description:
        //         'MANDREL TUBING HANGER 11" x 3-1/2" EU TOP & BTM, 3" BPV, CONN 2-3/8", MPACK 2-1/4",VP API 6A MONOGRAMMED, P-U, DD, PSL2, PR1',
        //       serial: 'MO04104-24-0001',
        //       brand: 'MISSIONPETROLEUM S.A',
        //       condition: 'NUEVO',
        //       observation: '',
        //     },
        //   ],
        // },
        // {
        //   label: 'Datos incorrectos ',
        //   data: [
        //     {
        //       quantity: 1,
        //       description: 'MASTERGATEVALVE 3 1/8" 5000 PSI EE, P-U, PSL 2, PR 1',
        //       serial: '123123123',
        //       brand: 'Cameron',
        //       condition: 'INSPECCIONADO',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'WINGGATEVALVE 3 1/8" 5000 PSI EE, P-U, PSL 2, PR 1',
        //       serial: '123123123',
        //       brand: 'Cameron',
        //       condition: 'INSPECCIONADO',
        //       observation: '',
        //     },
        //     {
        //       quantity: 1,
        //       description: 'SWABGATEVALVE 3 1/8" 5000 PSI EE, P-U, PSL 2, PR 1',
        //       serial: '123123123',
        //       brand: 'Cameron',
        //       condition: 'INSPECCIONADO',
        //       observation: '',
        //     },
        //     // Caso con error (descripción incorrecta)
        //     {
        //       description: 'UNKNOWN VALVE 3 1/8" 5000 PSI',
        //       condition: 'DESCONOCIDO',
        //       serial: '999',
        //       heat: '9999',
        //       brand: 'Cameron',
        //     },
        //   ],
        // },
      ],
      fileToTransform: [
        // {
        //   id: 1,
        //   file: 'ITP con packing list',
        //   required: false,
        //   extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //   extensionToShow: 'Archivo excel',
        //   hasSign: false,
        // },
        // {
        //   id: 2,
        //   file: 'ITP con packing list',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: false,
        // },
      ],
      availableFiles: [
        // {
        //   id: 2,
        //   file: 'Guía',
        //   required: false,
        //   extension: 'application/pdf',
        //   extensionToShow: 'Archivo pdf',
        //   hasSign: true,
        // },
      ],
      callback: (response: any) => this.handleUploadSuccess(response, 'Wellheads cargado'),
      //itpFiles: {
      //   NUEVO: [
      //     {
      //       id: 12,
      //       file: 'ITP para elementos NUEVOS - firmado por CAMERON',
      //       required: true,
      //       extension: 'application/pdf',
      //       extensionToShow: 'Subir archivo pdf',
      //       hasSign: true,
      //     },
      //     {
      //       id: 11,
      //       file: 'Dossier',
      //       required: true,
      //       extension: 'application/pdf',
      //       extensionToShow: 'Subir archivo pdf',
      //       hasSign: true,
      //     },
      //   ],
      //   'INSPECCIONADO-REPARADO': [
      //     {
      //       id: 10,
      //       file: 'ITP de liberación - firmado por CAMERON',
      //       required: true,
      //       extension: 'application/pdf',
      //       extensionToShow: 'Subir archivo pdf',
      //       hasSign: true,
      //     },
      //     {
      //       id: 11,
      //       file: 'Dossier',
      //       required: true,
      //       extension: 'application/pdf',
      //       extensionToShow: 'Subir archivo pdf',
      //       hasSign: true,
      //     },
      //   ],
      //   REUTILIZADO: [
      //     {
      //       id: 9,
      //       file: 'LDC - firmado por IWC',
      //       required: true,
      //       extension: 'application/pdf',
      //       extensionToShow: 'Subir archivo pdf',
      //       hasSign: true,
      //     },
      //   ],
      //},
    },
  ];

  public handleUploadSuccess(
    response: any,
    contextMsg: string = 'Archivo cargado exitosamente'
  ): void {
    console.log('=== UPLOAD SUCCESS CALLBACK ===');
    console.log(contextMsg);

    // 1. Normalizar la respuesta
    const responseServer = response.respuestaServidor || response;

    // 2. Si hay un archivo, procesarlo
    if (responseServer && responseServer.file) {
      const file = responseServer.file;

      // A. Actualizar DataToTransform (Lógica original)
      this.dataToTransform = { file: file };

      // B. Actualizar ReloadedFileObject (CRÍTICO: Esto activa el *ngIf del botón en el hijo)
      this.reloadedFileObject = file;

      // C. Generar URL si es necesario
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = URL.createObjectURL(file);

      console.log('✅ Archivo guardado en variables del padre:', file.name);

      // 3. Obtener metadatos (Hojas de excel)
      this.obtainSheetsService.getData(file).subscribe({
        next: (res: any) => {
          this.sheetsName = res.documentSheets || [];
          this.cdRef.detectChanges(); // Forzar actualización de la vista
        },
        error: error => console.error('Error al leer hojas:', error),
      });
    }
  }

  /**
   * Método generalizado para manejar el borrado de archivos.
   */
  public handleDeleteSuccess(response: any): void {
    console.log('Archivo eliminado. Limpiando variables temporales.');
    this.sheetsName = [];
    this.dataToTransform = null;
  }

  ngOnInit(): void {
    this.completedSteps = [false, false, false];

    try {
      if (localStorage.getItem('step')) {
        this.step = parseInt(localStorage.getItem('step')!);
      }
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem('step');
    }

    this.userSuscription = this.userSerivce.currentUser.subscribe(currentUser => {
      this.user = currentUser;
    });

    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      const idTypeOfRelease = parseInt(params['idTypeOfRelease']) || 1;
      this.releaseId = params['releaseId'];
      this.nameWell = decodeURIComponent(params['nameWell'] || '');
      this.sharedData.changeDataRelease({ releaseID: this.releaseId, wellName: this.nameWell });
      this.loadFilesInformation = this.bussinessLinesGuide.find(
        (bussinessLine: any) =>
          bussinessLine.id === this.user.idBusinessLine &&
          bussinessLine.idTypeOfRelease === idTypeOfRelease
      );
    });
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const nameWell = params['nameWell'];
      this.nameWell = decodeURIComponent(nameWell); // Decodificar URL
    });
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      this.releaseId = params['releaseId'];
      this.nameWell = decodeURIComponent(params['nameWell'] || '');
      this.sharedData.changeDataRelease({ releaseID: this.releaseId, wellName: this.nameWell });

      if (this.releaseId) {
        this.loadInitialFiles();
      }
    });
    this.countUniqueReleasesForBusinessLine(this.user.idBusinessLine);
  }

  private countUniqueReleasesForBusinessLine(idBusinessLine: number): void {
    const releasesForBusinessLine = this.bussinessLinesGuide.filter(
      (guide: any) => guide.id === idBusinessLine
    );
    const uniqueReleasesMap = new Map<number, string>();
    releasesForBusinessLine.forEach((release: any) => {
      if (release.idTypeOfRelease && release.nameOfTypeOfRelease) {
        uniqueReleasesMap.set(release.idTypeOfRelease, release.nameOfTypeOfRelease);
      }
    });

    this.numberOfReleasesOfUserBusinessLine = uniqueReleasesMap.size;

    if (this.numberOfReleasesOfUserBusinessLine > 1) {
      this.availableOptionsOfReleases = Array.from(uniqueReleasesMap.entries()).map(
        ([id, name]) => ({ id, name })
      );
    }
  }

  public onReleaseTypeSelected(releaseTypeId: number): void {
    this.loadFilesInformation = this.bussinessLinesGuide.find(
      (bussinessLine: any) =>
        bussinessLine.id === this.user.idBusinessLine &&
        bussinessLine.idTypeOfRelease === releaseTypeId
    );
    this.stepper.next();
  }

  public handleMtcUploadSuccess = (response: any) => {
    const file = response.fileToSave;

    if (file) {
      // Evitar duplicados
      const alreadyExists = this.mtcFileList.some(
        f => f.name === file.name || f.name === response.respuestaServidor?.fileName
      );

      if (!alreadyExists) {
        console.log('MTC guardado en memoria:', file.name);

        // Guardar ID si viene del servidor
        if (response.respuestaServidor && response.respuestaServidor.idStoredFiles) {
          (file as any).idStoredFiles = response.respuestaServidor.idStoredFiles;
        }

        // CORRECCIÓN CLAVE: Usar [...] en vez de .push() para notificar al hijo
        this.mtcFileList = [...this.mtcFileList, file];

        this.cdRef.detectChanges(); // Forzar actualización visual
      } else {
        console.warn('El archivo ya existe en la lista.');
      }
    }
  };

  // Callback para cuando se borra un archivo
  public handleMtcDeleteSuccess = (response: any) => {
    console.log('Archivo eliminado del servidor, actualizando memoria...');

    // El componente button-upload devuelve los parámetros que usó para borrar
    const paramsDeleted = response.paramsToDelete;

    if (paramsDeleted && paramsDeleted.idStoredFiles) {
      const idToDelete = paramsDeleted.idStoredFiles;

      // Filtramos la lista para sacar el archivo que tenga ese ID
      const initialLength = this.mtcFileList.length;
      this.mtcFileList = this.mtcFileList.filter(f => (f as any).idStoredFiles !== idToDelete);

      if (this.mtcFileList.length < initialLength) {
        console.log(`Archivo con ID ${idToDelete} eliminado de la memoria ram.`);
      }
    }

    // Opcional: Si quieres estar 100% seguro, puedes recargar todo (aunque es más lento)
    // this.loadInitialFiles();
  };

  // En well-information-screen.component.ts

  loadInitialFiles(): void {
    const reloadUrl = environment.serverUrl + environment.endpoints.fileReloadToRelease.url;
    this.http.post<any>(reloadUrl, { idRelease: this.releaseId }).subscribe({
      next: response => {
        if (response && Array.isArray(response.data)) {
          const allFilesMetadata = response.data;

          // 1. Lógica para Tally (ID 1)
          const idToFind = this.loadFilesInformation.id === 2 ? 13 : 1;
          const processableFileMetadata = allFilesMetadata.find(
            (dbFile: any) => dbFile.idStandardFileTypesOfRelease === idToFind
          );

          // 2. Lógica para MTCs (ID 13)
          const mtcFilesMetadata = allFilesMetadata.filter(
            (dbFile: any) => dbFile.idStandardFileTypesOfRelease === 13
          );

          console.log('MTCs encontrados en BD:', mtcFilesMetadata.length); // LOG PARA DEPURAR

          if (
            mtcFilesMetadata.length > 0 &&
            this.loadFilesInformation.id === 1 &&
            this.loadFilesInformation.idTypeOfRelease === 2
          ) {
            // Mapeamos para la vista
            this.initialMtcFiles = mtcFilesMetadata.map((dbFile: any) => ({
              file: new File([], dbFile.fileName, { type: dbFile.fileExtension }),
              stateUpload: { progress: 100, completed: true },
              idStoredFiles: dbFile.idStoredFiles,
              pathToFile: dbFile.filePath,
              idStandardFileTypesOfRelease: dbFile.idStandardFileTypesOfRelease,
            }));

            this.downloadMtcFilesContent(mtcFilesMetadata);

            this.cdRef.detectChanges();
          }

          // Continuación lógica Tally...
          if (processableFileMetadata) {
            this.downloadAndGetSheets(processableFileMetadata, allFilesMetadata);
          } else {
            this.initialFilesForChild = allFilesMetadata.map((dbFile: any) => ({
              file: new File([], dbFile.fileName, { type: dbFile.fileExtension }),
              stateUpload: { progress: 100, completed: true },
              idStoredFiles: dbFile.idStoredFiles,
              pathToFile: dbFile.filePath,
              idStandardFileTypesOfRelease: dbFile.idStandardFileTypesOfRelease,
            }));
            this.cdRef.detectChanges(); // También aquí por si acaso
          }
        } else {
          this.initialFilesForChild = [];
        }
      },
      error: err => console.error('Error recargando archivos:', err),
    });
  }

  downloadMtcFilesContent(filesMetadata: any[]) {
    this.mtcFileList = [];
    const processedNames = new Set<string>();
    const downloadUrl = environment.serverUrl + environment.endpoints.obtainFile.url;

    filesMetadata.forEach(meta => {
      if (processedNames.has(meta.fileName)) return;
      processedNames.add(meta.fileName);

      const body = {
        idStoredFiles: meta.idStoredFiles,
        filePath: meta.filePath,
        fileName: meta.fileName,
      };

      this.http.post(downloadUrl, body, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const exists = this.mtcFileList.some(f => f.name === meta.fileName);
          if (!exists) {
            const file = new File([blob], meta.fileName, { type: meta.fileExtension });

            // TRUCO: Guardamos el ID dentro del objeto File para poder borrarlo después
            (file as any).idStoredFiles = meta.idStoredFiles;

            this.mtcFileList.push(file);
            console.log(`Blob recuperado: ${meta.fileName} (ID: ${meta.idStoredFiles})`);
          }
        },
        error: err => console.error(`Error descargando ${meta.fileName}`, err),
      });
    });
  }

  downloadAndGetSheets(fileMetadata: any, allFiles: any[]): void {
    const downloadUrl = environment.serverUrl + environment.endpoints.obtainFile.url;
    const body = {
      idStoredFiles: fileMetadata.idStoredFiles,
      filePath: fileMetadata.filePath,
      fileName: fileMetadata.fileName,
    };

    this.http.post(downloadUrl, body, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const downloadedFile = new File([blob], fileMetadata.fileName, {
          type: fileMetadata.fileExtension,
        });
        this.reloadedFileObject = downloadedFile;

        this.obtainSheetsService.getData(downloadedFile).subscribe({
          next: (sheetsResponse: any) => {
            // Llena la propiedad 'sheetsName' que se pasa al hijo para el dropdown
            this.sheetsName = sheetsResponse.documentSheets;
          },
          error: err => console.error('Error al obtener las hojas del archivo recargado:', err),
        });

        this.initialFilesForChild = allFiles.map((dbFile: any) => {
          if (dbFile.idStoredFiles === fileMetadata.idStoredFiles) {
            if (this.objectUrl) {
              URL.revokeObjectURL(this.objectUrl);
            }
            this.objectUrl = URL.createObjectURL(downloadedFile);
            return {
              file: downloadedFile,
              stateUpload: { progress: 100, completed: true },
              idStoredFiles: dbFile.idStoredFiles,
              pathToFile: this.objectUrl,
              idStandardFileTypesOfRelease: dbFile.idStandardFileTypesOfRelease,
            };
          } else {
            return {
              file: new File([], dbFile.fileName, { type: dbFile.fileExtension }),
              stateUpload: { progress: 100, completed: true },
              idStoredFiles: dbFile.idStoredFiles,
              pathToFile: dbFile.filePath,
              idStandardFileTypesOfRelease: dbFile.idStandardFileTypesOfRelease,
            };
          }
        });
      },
      error: err => console.error('Error al descargar el archivo:', err),
    });
  }

  public onRowDataChange(updatedData: any[]): void {
    this.rowData = updatedData;
  }

  receiveCompletedSteps(data: boolean[]) {
    this.completedSteps = data;
  }
  stepperNext(event: any) {
    if (event.isNext) {
      this.rowData = event.rowData;
      this.userPipeSelected = event.userPipeSelected;
      this.stepper.next();
    }
  }
  getAvailableDocuments(event: any) {
    this.availableDocuments = event;
  }
  getsTallySheet(event: any) {
    this.tallySheet = event;
  }

  @ViewChild('stepper') stepper: MatStepper;

  completedSteps: boolean[] = [];
  tallySheet: ButtonUploadComponent;
  availableDocuments: QueryList<ButtonUploadComponent>;
  userPipeSelected: string;
  public rowData: any[];
  title: string = 'Cargar Información';

  bussinessLineChosen: any = 1;
  loadFilesInformation: any;
  private sharedService = inject(SharedDataService);
  private releaseInfo: any = Object;
  private notificationService = inject(NotificationsService);

  hasDocuments: boolean = false;

  receiveHasDocumentsEvent(event: boolean) {
    this.hasDocuments = event;

    if (this.hasDocuments && !this.isInitialLoadComplete) {
      this.isInitialLoadComplete = true;
      setTimeout(() => {
        this.stepper.selectedIndex = 0;
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  getFormattedTimestamp = () => {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  async onSendData() {
    this.sharedService.currentElement.subscribe((data: any) => {
      this.releaseInfo = data;
    });
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    if (!user) {
      console.error('Usuario no encontrado en localStorage');
      return;
    }

    const dataToSend = {
      idRelease: this.releaseInfo.releaseID,
      idReleaseState: this.user.idBusinessLine === 1 ? 4 : 2, // Para logistica pasa directo a campo, para el resto a QAQC
      idCreatedBy: user.id,
    };

    const releaseInfo = {
      userEmail: user.email,
      user: user.nameUser + ' | ' + user.email,
      nameWell: this.releaseInfo.wellName,
      updateDate: this.getFormattedTimestamp(),
      url: `${environment.frontEndServer}${environment.frontEndpoints.releases.review.url}?releaseId=${this.releaseInfo.releaseID}&nameWell=${this.nameWell}`,
      idRelease: this.releaseInfo.releaseID,
    };

    this.updateReleaseStateService
      .update(dataToSend.idReleaseState, dataToSend.idRelease, dataToSend.idCreatedBy)
      .pipe(
        switchMap(() => this.notificationService.postNotification(releaseInfo)) // Cambia al Observable de la notificación
      )
      .subscribe({
        next: res => {
          const urlToRedirect =
            this.user.idBusinessLine === 1
              ? environment.frontEndpoints.releases.pecReview.url
              : environment.frontEndpoints.releases.qaqcReview.url;
          this.router.navigate(['/' + urlToRedirect]);
        },
        error: err => {
          console.error('Error:', err);
        },
      });

    // this.updateReleaseStateService.update(dataToSend.idReleaseState, dataToSend.idRelease, dataToSend.idCreatedBy).subscribe(async (response: any) => {
    //   await this.notificationService.postNotification(releaseInfo).subscribe(res => console.log(res))
    //   this.router.navigate(environment.frontEndpoints.releases.pecReview.url);
    // });
  }

  selectionChange(event: any): void {
    if (this.completedSteps[event.selectedIndex]) {
      for (let i = event.selectedIndex; i < this.stepper.steps.length; i++) {
        this.completedSteps[i] = false;
        this.stepper.steps.get(i)!.editable = true;
        localStorage.removeItem('step');
      }
    }
  }

  selectedDataFunc(event: any) {
    this.selectedData = event;
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.queryParamsSubscription.unsubscribe();
    this.userSuscription.unsubscribe();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.mtcFileList = [];
    this.initialMtcFiles = [];
    console.log('Limpieza de memoria MTC realizada al destruir componente.');
  }

  getRowDataFromTable(event: any) {
    this.rowDataFromTable = event;
  }
}
