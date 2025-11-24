import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { QaqcServiceService } from 'src/app/services/qaqc-service.service';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';

@Component({
  selector: 'app-approve-screen',
  templateUrl: './approve-screen.component.html',
  styleUrls: ['./approve-screen.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ApproveScreenComponent implements OnInit {
  constructor(
    public cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private qaqcService: QaqcServiceService
  ) {
    this.route.queryParamMap.subscribe(params => {
      const idReleaseParam = params.get('releaseId');
      this.idRelease = idReleaseParam !== null ? +idReleaseParam : 0;
      const nameWellParam = params.get('nameWell');
      this.nameWell = nameWellParam !== null ? nameWellParam : 'ERROR AL CARGAR INFORMACION';
    });

    this.qaqcService.getElementsRelease(this.idRelease).subscribe({
      next: (response: any) => {
        this.pendingInformation = response;
        this.isFetchData = true;
      },
      complete() {},
      error: error => {},
    });
  }

  completedSteps: boolean[] = [];
  pendingInformation: {};
  isFetchData: boolean = false;

  nameWell: string;
  idRelease: number;
  private subscription: Subscription;

  @ViewChild('stepper') stepper: MatStepper;
  selectionChange(event: any): void {
    if (this.completedSteps[event.selectedIndex]) {
      for (let i = event.selectedIndex; i < this.stepper.steps.length; i++) {
        this.completedSteps[i] = false;
        this.stepper.steps.get(i)!.editable = true;
      }
    }
  }

  stepperNext(event: any) {
    this.cdRef.detectChanges();
    this.stepper.next();
  }

  loadFilesInformation: any;

  bussinessLines: any = [
    {
      id: 1,
      name: 'logistic',
      fileToTransform: [
        {
          id: 1,
          file: 'Tallysheet',
          required: false,
          extension: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          extensionToShow: 'Archivo excel',
          hasSign: false,
        },
      ],
      availableFiles: [
        {
          id: 2,
          file: 'Guía',
          required: false,
          extension: 'application/pdf',
          extensionToShow: 'Archivo pdf',
          hasSign: true,
        },
      ],
      callback: async (response: any) => {},
    },
  ];

  bussinessLineChosen: any = 1;
  releaseId: string;

  sharedData = inject(SharedDataService);
  rowData: any[];
  ngOnInit(): void {
    this.completedSteps = [false, false];
    this.loadFilesInformation = this.bussinessLines.find(
      (bussinessLine: any) => bussinessLine.id === this.bussinessLineChosen
    );

    this.route.queryParams.subscribe(params => {
      const releaseId = params['releaseId'];
      const nameWell = params['nameWell'];

      // Asignar los valores a variables si es necesario
      this.releaseId = releaseId;
      this.nameWell = decodeURIComponent(nameWell); // Decodificar URL

      // Puedes usar estos valores para tu lógica

      this.sharedData.changeDataRelease({ releaseID: this.releaseId, wellName: this.nameWell });
    });
  }

  sendNextData() {
    this.stepperNext({ data: {} });
  }

  receiveCompletedSteps() {
    this.completedSteps = this.completedSteps;
  }

  onPressReject = () => {
    this.pendingInformation = {};
  };

  onPressButton = () => {
    this.completedSteps[0] = true;
    this.receiveCompletedSteps();
    this.sendNextData();
  };
}
