import { Component, inject } from '@angular/core';
import { UserService } from 'src/app/features/auth/services/user.service';
import { ReleaseService } from 'src/app/services/release.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent {
  idBusinessLine: number;
  idUser: number;
  idFromState: number;
  idToState: number;
  emailUser: string;
  idStandardStates: number;
  releaseId: number = 0;
  idReleaseState: number;
  idBusinessLineThatCreatedRelease: number;
  canEdit: boolean = false;

  idFromStateReject: number;
  idToStateReject: number;
  idStandardStatesReject: number;

  private userSerivce = inject(UserService);

  constructor(
    private releaseService: ReleaseService,
    private route: ActivatedRoute
  ) {}

  configStates: any = {
    2: {
      // El encargado de revisar es QAQC, puede revisar pero no editar El segmento, para saber que fue lo que envio, y puede PEC en caso que rechazo y quiere ver que rechazo
      accept: {
        idFromState: 2,
        idToState: 3,
        idStandardStates: 1, // HACE REFERENCIA A PASAR DE QAQC A PEC
      },
      reject: {
        idFromState: 2,
        idToState: 1,
        idStandardStates: 2,
      },
      idBusinessLineCanEdit: 7,
    },
    3: {
      // El encargado de revisar es PEC, pero como no tiene acceso cambiara QAQC, puede revisar pero no editar El segmento, para saber que fue lo que envio
      accept: {
        idFromState: 3,
        idToState: 4,
        idStandardStates: 1, // HACE REFERENCIA A PASAR DE QAQC A PEC
      },
      reject: {
        idFromState: 3,
        idToState: 2,
        idStandardStates: 2,
      },
      idBusinessLineCanEdit: 7,
    },
  };

  configStatesLogistic: any = {
    2: {
      // El encargado de revisar es QAQC, puede revisar pero no editar El segmento, para saber que fue lo que envio, y puede PEC en caso que rechazo y quiere ver que rechazo
      accept: {
        idFromState: 2,
        idToState: 4, // Logistica se pasa directo sin revision de QAQC
        idStandardStates: 1, // HACE REFERENCIA A PASAR DE QAQC A Campo
      },
      reject: {
        idFromState: 2,
        idToState: 1,
        idStandardStates: 2,
      },
      idBusinessLineCanEdit: 7,
    },
  };

  ngOnInit(): void {
    this.userSerivce.currentUser.subscribe(currentUser => {
      this.idBusinessLine = currentUser.idBusinessLine;
      this.idUser = currentUser.id;
      this.emailUser = currentUser.email;
    });

    this.route.queryParamMap.subscribe(params => {
      let value = params.get('releaseId');
      let releaseIDValue = value !== null ? parseInt(value, 10) : 0;
      this.releaseId = releaseIDValue;

      // Solo ejecuta esta parte si releaseId tiene un valor válido
      if (this.releaseId && this.releaseId !== 0) {
        this.releaseService.getReleaseData(this.releaseId).subscribe({
          next: (response: any) => {
            // Asignar directamente el valor devuelto por el servicio
            this.idReleaseState = response.data[0].idReleaseState;
            this.idBusinessLineThatCreatedRelease = response.data[0].idBusinessLine;

            // Para Logistica tiene otra configuracion
            if (this.idBusinessLineThatCreatedRelease === 1) {
              this.idFromState = this.configStatesLogistic[this.idReleaseState].accept.idFromState;
              this.idToState = this.configStatesLogistic[this.idReleaseState].accept.idToState;
              this.idStandardStates =
                this.configStatesLogistic[this.idReleaseState].accept.idStandardStates;

              this.idFromStateReject =
                this.configStatesLogistic[this.idReleaseState].reject.idFromState;
              this.idToStateReject =
                this.configStatesLogistic[this.idReleaseState].reject.idToState;
              this.idStandardStatesReject =
                this.configStatesLogistic[this.idReleaseState].reject.idStandardStates;

              this.canEdit =
                this.configStatesLogistic[this.idReleaseState].idBusinessLineCanEdit ===
                this.idBusinessLine
                  ? true
                  : false;
            } else {
              this.idFromState = this.configStates[this.idReleaseState].accept.idFromState;
              this.idToState = this.configStates[this.idReleaseState].accept.idToState;
              this.idStandardStates =
                this.configStates[this.idReleaseState].accept.idStandardStates;

              this.idFromStateReject = this.configStates[this.idReleaseState].reject.idFromState;
              this.idToStateReject = this.configStates[this.idReleaseState].reject.idToState;
              this.idStandardStatesReject =
                this.configStates[this.idReleaseState].reject.idStandardStates;

              this.canEdit =
                this.configStates[this.idReleaseState].idBusinessLineCanEdit === this.idBusinessLine
                  ? true
                  : false;
            }

            console.log('Voy a pasar de');
            console.log(this.idFromState);
            console.log(this.idToState);
            console.log(this.idStandardStates);
            console.log(this.canEdit);
          },
          error: err => {
            console.error('Error al obtener los datos:', err);
          },
        });
      }
    });
  }
}
