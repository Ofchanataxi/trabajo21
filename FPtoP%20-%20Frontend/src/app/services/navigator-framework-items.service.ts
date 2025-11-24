import { Injectable } from '@angular/core';
import { NavItem } from '@slb-dls/angular-material/shared';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserInfo } from '../features/auth/services/user.service';
import { TeamsService } from './teams.service';

@Injectable({
  providedIn: 'root',
})
export class NavigatorFrameworkItemsService {
  constructor(private teamsService: TeamsService) {}

  public user: UserInfo;
  contactSupport(): void {
    this.teamsService.openTeamsChat(this.user);
  }
  private navigatorSecondaryItems: { [key: string]: NavItem[] } = {
    1: [
      {
        label: 'Pozos',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'well-model',
      },
      {
        label: 'Seleccionar un pozo',
        routerLink: 'wells',
        url: 'wells',
        target: 'Active Wells',
      },
      {
        label: 'Elementos por revisar',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'toolkit',
      },
      {
        label: 'En borrador',
        url: environment.frontEndpoints.releases.draft.url,
        routerLink: environment.frontEndpoints.releases.draft.url,
      },
      // {
      //   label: 'Por revisar QAQC',
      //   routerLink: environment.frontEndpoints.releases.qaqcReview.url,
      //   url: environment.frontEndpoints.releases.qaqcReview.url,
      // },
      // {
      //   label: 'Por revisar PEC',
      //   routerLink: environment.frontEndpoints.releases.pecReview.url,
      //   url: environment.frontEndpoints.releases.pecReview.url,
      // },
      {
        label: 'Enviados a Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        url: environment.frontEndpoints.releases.approved.url,
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
      // {
      //   label: 'Manejo de Elementos',
      //   routerLink: environment.frontEndpoints.releases.elements.url,
      //   url: environment.frontEndpoints.releases.elements.url,
      // },
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: environment.frontEndpoints.releases.support.url,
        url: environment.frontEndpoints.releases.support.url,
        target: '#',
      },
      {
        label: 'Verificar información',
        routerLink: environment.frontEndpoints.releases.validateDescription.url,
        url: environment.frontEndpoints.releases.validateDescription.url,
      },
      {
        label: 'Aviso de privacidad',
        routerLink: environment.frontEndpoints.privacy.url,
        url: environment.frontEndpoints.privacy.url,
      },
    ],
    2: [
      {
        label: 'Pozos',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'well-model',
      },
      {
        label: 'Seleccionar un pozo',
        routerLink: 'wells',
        url: 'wells',
        target: 'Active Wells',
      },
      {
        label: 'Elementos por revisar',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'toolkit',
      },
      {
        label: 'En borrador',
        url: environment.frontEndpoints.releases.draft.url,
        routerLink: environment.frontEndpoints.releases.draft.url,
      },
      {
        label: 'Por revisar QAQC',
        routerLink: environment.frontEndpoints.releases.qaqcReview.url,
        url: environment.frontEndpoints.releases.qaqcReview.url,
      },
      {
        label: 'Por revisar PEC',
        routerLink: environment.frontEndpoints.releases.pecReview.url,
        url: environment.frontEndpoints.releases.pecReview.url,
      },
      {
        label: 'Enviados a Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        url: environment.frontEndpoints.releases.approved.url,
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: environment.frontEndpoints.releases.support.url,
        url: environment.frontEndpoints.releases.support.url,
        target: '#',
      },
    ],
    3: [
      {
        label: 'Pozos',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'well-model',
      },
      {
        label: 'Seleccionar un pozo',
        routerLink: 'wells',
        url: 'wells',
        target: 'Active Wells',
      },
      {
        label: 'Elementos por revisar',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'toolkit',
      },
      {
        label: 'En borrador',
        url: environment.frontEndpoints.releases.draft.url,
        routerLink: environment.frontEndpoints.releases.draft.url,
      },
      {
        label: 'Por revisar QAQC',
        routerLink: environment.frontEndpoints.releases.qaqcReview.url,
        url: environment.frontEndpoints.releases.qaqcReview.url,
      },
      {
        label: 'Por revisar PEC',
        routerLink: environment.frontEndpoints.releases.pecReview.url,
        url: environment.frontEndpoints.releases.pecReview.url,
      },
      {
        label: 'Enviados a Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        url: environment.frontEndpoints.releases.approved.url,
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: environment.frontEndpoints.releases.support.url,
        url: environment.frontEndpoints.releases.support.url,
        target: '#',
      },
    ],
    4: [
      {
        label: 'Pozos',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'well-model',
      },
      {
        label: 'Seleccionar un pozo',
        routerLink: 'wells',
        url: 'wells',
        target: 'Active Wells',
      },
      {
        label: 'Elementos por revisar',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'toolkit',
      },
      {
        label: 'En borrador',
        url: environment.frontEndpoints.releases.draft.url,
        routerLink: environment.frontEndpoints.releases.draft.url,
      },
      {
        label: 'Por revisar QAQC',
        routerLink: environment.frontEndpoints.releases.qaqcReview.url,
        url: environment.frontEndpoints.releases.qaqcReview.url,
      },
      {
        label: 'Por revisar PEC',
        routerLink: environment.frontEndpoints.releases.pecReview.url,
        url: environment.frontEndpoints.releases.pecReview.url,
      },
      {
        label: 'Enviados a Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        url: environment.frontEndpoints.releases.approved.url,
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: environment.frontEndpoints.releases.support.url,
        url: environment.frontEndpoints.releases.support.url,
        target: '#',
      },
    ],
    0: [
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: '#',
        url: '#',
        target: '#',
      },
    ],
    7: [
      {
        label: 'Elementos por revisar',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'toolkit',
      },
      {
        label: 'Por revisar QAQC',
        routerLink: environment.frontEndpoints.releases.qaqcReview.url,
        url: environment.frontEndpoints.releases.qaqcReview.url,
      },
      {
        label: 'Por revisar PEC',
        routerLink: environment.frontEndpoints.releases.pecReview.url,
        url: environment.frontEndpoints.releases.pecReview.url,
      },
      {
        label: 'Enviados a Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        url: environment.frontEndpoints.releases.approved.url,
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
      {
        label: 'Manejo de Elementos',
        routerLink: environment.frontEndpoints.releases.elements.url,
        url: environment.frontEndpoints.releases.elements.url,
      },
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: environment.frontEndpoints.releases.support.url,
        url: environment.frontEndpoints.releases.support.url,
        target: '#',
      },
    ],
    5: [
      {
        label: 'Elementos por revisar',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
        icon: 'toolkit',
      },
      {
        label: 'Enviados a Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        url: environment.frontEndpoints.releases.approved.url,
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
      {
        label: 'Otros enlaces',
        disabled: true,
        active: false,
        routerLink: '',
        url: 'label',
        target: 'label',
      },
      {
        label: 'Inicio',
        routerLink: 'home',
        url: 'home',
        target: 'Inicio',
      },
      {
        label: '¿Necesitas ayuda?',
        routerLink: environment.frontEndpoints.releases.support.url,
        url: environment.frontEndpoints.releases.support.url,
        target: '#',
      },
    ],
  };

  private frameworkItems: { [key: string]: NavItem[] } = {
    needCheck: [
      {
        label: 'Pendientes',
        routerLink: ['quality', 'check-pendings'],
        target: 'pending',
      },
      {
        label: 'Aprobados',
        routerLink: ['quality', 'approved'],
        target: 'approve',
      },
      {
        label: 'Rechazados',
        routerLink: ['quality', 'rejected'],
        target: 'reject',
      },
    ],
    logisticCreatedElements: [
      {
        label: 'Revisión Segmento',
        routerLink: environment.frontEndpoints.releases.draft.url,
        target: 'release-drafts',
      },
      {
        label: 'Revisión QAQC',
        routerLink: environment.frontEndpoints.releases.qaqcReview.url,
        target: 'release-qaqcReview',
      },
      {
        label: 'Revisión PEC',
        routerLink: environment.frontEndpoints.releases.pecReview.url,
        target: 'release-pecReview',
      },
      {
        label: 'Enviados Campo',
        routerLink: environment.frontEndpoints.releases.approved.url,
        target: 'release-approved',
      },
      {
        label: 'Estado de Pozos',
        routerLink: 'active',
        url: 'active',
        target: 'Active New Wells ',
      },
    ],
  };

  getNavItems(idBusinessLine: number): NavItem[] {
    if (this.navigatorSecondaryItems[idBusinessLine]) {
      return this.navigatorSecondaryItems[idBusinessLine];
    } else {
      return this.navigatorSecondaryItems[0];
    }
  }

  getFrameworkItems(navItem: string): NavItem[] {
    return this.frameworkItems[navItem] || [];
  }

  /* getFrameworkItems(): NavItem[] {
    return this.frameworkItems.needCheck;
  } */
}
