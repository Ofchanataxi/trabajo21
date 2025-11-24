import { Component, Input, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { ButtonRarUploadComponent } from 'src/app/atoms/button-rar-upload/button-rar-upload.component';
import { WellInformationService } from 'src/app/pages/field/services/well-information.service';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { UpdateReleaseStateService } from 'src/app/services/update-release-state.service';
@Component({
  selector: 'app-add-sign-files',
  templateUrl: './add-sign-files.component.html',
  styleUrls: ['./add-sign-files.component.scss'],
})
export class AddSignFilesComponent {
  constructor(
    private router: Router,
    private wellInformationService: WellInformationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private updateReleaseStateService: UpdateReleaseStateService
  ) {}

  @Input() pendingInformation: { [key: string]: any } = {};
  @ViewChild('signedITPFile') signedITPFile: ButtonRarUploadComponent;

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

  loadFilesInformation: any;
  bussinessLineChosen: any = 1;
  releaseId: string;
  nameWell: string;
  idRelease: number;
  sharedData = inject(SharedDataService);
  private releaseInfo: any = Object;

  ngOnInit(): void {
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

  fileExample: File = new File(
    [
      new Blob(['Este es el contenido del archivo.'], {
        type: 'application/pdf',
      }),
    ],
    'file.pdf',
    {
      type: 'application/pdf',
      lastModified: new Date().getTime(),
    }
  );

  acceptButton() {
    try {
      this.sharedData.currentElement.subscribe((data: any) => {
        this.releaseInfo = data;
      });
      const dataToSend = {
        idRelease: this.releaseInfo.releaseID,
        idReleaseState: 4, // Quiero que pase a aceptado
        idCreatedBy: 2, //TODO: ENVIAR EL USUARIO QUE REALIZO
      };

      this.updateReleaseStateService
        .update(dataToSend.idReleaseState, dataToSend.idRelease, dataToSend.idCreatedBy)
        .subscribe((response: any) => {
          this.messageService.add({
            severity: SlbSeverity.Success,
            summary: 'Información aprobada correctamente',
            detail: '',
          });

          this.router.navigate(['/quality/check-pendings']);
        });

      // let data: any = {
      //   pendingInformation: this.pendingInformation,
      //   signedFiles: this.signedITPFile.files,
      // };
      //   this.wellInformationService
      //     .postAcceptedWellInformation(data)
      //     .subscribe({
      //       next: () => {
      //         this.messageService.add({
      //           severity: SlbSeverity.Success,
      //           summary: "Información aprobada correctamente",
      //           detail: "",
      //         });
      //         this.router.navigate(["/quality/check-pendings"], {
      //           queryParams: { idWell: id, nameWell: param },
      //         });
      //       },
      //       error: (error) => {
      //         console.log(error);
      //         this.messageService.add({
      //           severity: SlbSeverity.Error,
      //           summary: "Problema al enviar la información",
      //           detail: "Intente de nuevo",
      //         });
      //       },
      //     });
      //     if (this.signedITPFile.files.length !== 0) {
      // } else {
      //   this.messageService.add({
      //     severity: SlbSeverity.Error,
      //     summary: "Subir ITP firmado",
      //     detail: "",
      //   });
      // }
    } catch (error) {
      this.messageService.add({
        severity: SlbSeverity.Error,
        summary: 'Ocurrió un error',
        detail: '',
      });
    }
  }
}
