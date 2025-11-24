import { Component, ContentChild, Input, QueryList, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { stat } from 'fs';
import { format } from 'path';
import { ButtonComponent } from 'src/app/atoms/button/button.component';

type StatusKey =
  | 'ABANDON'
  | 'DRILLING'
  | 'DRL_PLAN'
  | 'INACTIVE'
  | 'INYECTING'
  | 'PRODUCING'
  | 'SHUT_IN'
  | 'SUSP_WO'
  | 'SUSPEND'
  | 'WORKOVER';

type FormatStatus = {
  [key in StatusKey]: {
    name: string;
    description: string;
  };
};

@Component({
  selector: 'app-custom-card',
  templateUrl: './custom-card.component.html',
  styleUrls: ['./custom-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomCardComponent {
  constructor(private snackBar: MatSnackBar) {}

  @ContentChild(ButtonComponent) runbesButton: QueryList<ButtonComponent>;
  @ContentChild(ButtonComponent) getIntoButton: QueryList<ButtonComponent>;

  @Input() title: string;
  @Input() longNameWell: string;
  @Input() date: string;
  @Input() activity: string;
  @Input() status: string;

  @Input() dateStartActivity: string;
  @Input() dateEndActivity: string;

  @Input() jobLogEndSuspen: string;
  @Input() jobLogStartSuspen: string;

  @Input() disableRunBes: boolean = true;
  @Input() element: any;

  ngAfterContentInit() {}

  ngOnInit(): void {}

  runbesButtonWork(event: any) {
    console.log('RunBes it works');
  }

  getIntoWork(event: any) {
    console.log('Get into it works');
  }

  getFormattedStatusLabel(): string {
    const formatted = this.getFormatStatus()[this.status as StatusKey];
    return formatted ? formatted.name.toUpperCase() : 'INDEFINIDO';
  }

  getFormattedStatusDescription(): string {
    const formatted = this.getFormatStatus()[this.status as StatusKey];
    return formatted ? formatted.description : 'Sin descripción disponible';
  }

  showDescription: boolean = false;

  toggleStatusDescription(): void {
    this.showDescription = !this.showDescription;
  }

  getFormatStatus(): FormatStatus {
    return {
      ABANDON: {
        name: 'Abandonado',
        description:
          'Pozo que ha sido cerrado y sellado permanentemente,y ya no se utiliza, después de que ha dejado de ser económicamente viable para la producción.',
      },
      DRILLING: {
        name: 'Perforación',
        description: 'Pozo que se encuentra en proceso de perforación.',
      },
      DRL_PLAN: {
        name: 'Plan de Perforación',
        description: 'Pozo en plan de perforación.',
      },
      INACTIVE: {
        name: 'Inactivo',
        description:
          'Pozo que ya no produce activamente petróleo o gas, inyecta fluidos ni elimina desechos, pero que no ha sido abandonado o desmantelado de forma permanente.',
      },
      INYECTING: {
        name: 'Inyección',
        description:
          '	Pozo utilizado para inyectar fluidos, como agua, salmuera o gas, en formaciones subterráneas, principalmente para mejorar la recuperación de petróleo o desechar de manera segura los fluidos producidos.',
      },
      PRODUCING: {
        name: 'Producción',
        description:
          'Pozo que extrae activamente petróleo, gas o ambos de un yacimiento en el subsuelo.',
      },
      SHUT_IN: {
        name: 'Aislado',
        description:
          'Pozo que está cerrado temporalmente, deteniendo la producción o inyección, ya sea cerrando válvulas u otros medios físicos.',
      },
      SUSP_WO: {
        name: 'Suspendido Esperando WO',
        description:
          'Pozo que ha sido aislado temporalmente del yacimiento productor, pero está planificado para un plan de reacondicionamiento.',
      },
      SUSPEND: {
        name: 'Suspendido',
        description:
          'Pozo en el que se han cesado temporalmente las operaciones de perforación o producción, pero el pozo se mantiene en un estado en el que puede reactivarse fácilmente.',
      },
      WORKOVER: {
        name: 'Workover',
        description: 'Pozo en reacondicionamiento.',
      },
    };
  }
}
