import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ActivePipesComponent } from './pages/active-pipes/active-pipes.component';
import { WellInformationScreenComponent } from './pages/wells-screen/well-information-screen/well-information-screen.component';

///////////////field module
import { FieldHomeComponent } from './pages/field/home/field-home.component';
import { FieldComponent } from './pages/field/field.component';
import { FieldActivationRequestComponent } from './pages/field/activation-request/field-activation-request.component';

///////////////field module

import { PendingChecksScreenComponent } from './pages/quality/pending-checks-screen/pending-checks-screen.component';
import { ApproveScreenComponent } from './pages/quality/approve/approve-screen/approve-screen.component';
import { RejectedWellSentInformationComponent } from './pages/quality/rejected-approved-screens/rejected-well-sent-information/rejected-well-sent-information.component';
import { ApprovedWellSentInformationComponent } from './pages/quality/rejected-approved-screens/approved-well-sent-information/approved-well-sent-information.component';
import { SendToPECComponent } from './pages/quality/pending-PEC/send-to-pec/send-to-pec.component';
import { UploadSignFilesComponent } from './pages/quality/pending-PEC/upload-sign-files/upload-sign-files.component';
import { ApprovedByQualityComponent } from './pages/segment/approved-by-quality/approved-by-quality.component';
import { ApprovedByPecComponent } from './pages/segment/approved-by-pec/approved-by-pec.component';
import { PendingToCheckComponent } from './features/pec/pages/pending-to-check/pending-to-check.component';
import { ShowQaqcApprovedRejectedInformationComponent } from './pages/quality/rejected-approved-screens/show-qaqc-approved-rejected-information/show-qaqc-approved-rejected-information.component';
import { authGuard } from './core/guards/auth.guard';
import { AccessDeniedComponent } from './shared/components/templates/access-denied/access-denied.component';
import { DashboardPageComponent } from './shared/pages/dashboard-page/dashboard-page.component';
import { LogisticHomePageComponent } from './features/logistic/pages/logistic-home-page/logistic-home-page.component';
import { PendingChecksPageComponent } from './features/logistic/pages/pending-checks-page/pending-checks-page.component';
import { DraftsChecksPageComponent } from './features/logistic/pages/drafts-checks-page/drafts-checks-page.component';
import { RejectedChecksPageComponent } from './features/logistic/pages/rejected-checks-page/rejected-checks-page.component';
import { CheckOilFieldOperationComponent } from './shared/pages/check-oil-field-operation/check-oil-field-operation.component';
import { NotificationBadgeComponent } from './shared/components/atoms/notification-badge/notification-badge.component';
import { AppFieldRunBesComponent } from './pages/field/organism/field-dynamic-content/field-run-bes/field-run-bes.component';
import { SupportDocumentListComponent } from './shared/components/organism/support-document-list/support-document-list.component';
import { QAQCReviewComponent } from './pages/releases/qaqcReview/qaqc-review.component';
import { DraftComponent } from './pages/releases/draft/draft.component';
import { PECReviewComponent } from './pages/releases/pecReview/pec-review.component';
import { ApprovedComponent } from './pages/releases/approved/approved.component';
import { environment } from 'src/environments/environment';
import { SharedHomeTemplateComponent } from './shared/components/templates/shared-home-template/shared-home-template.component';
import { ReviewComponent } from './pages/releases/review/review.component';
import { SupportComponent } from './pages/releases/support/support.component';
import { ActiveComponent } from './pages/releases/active/active.component';
import { ActiveWellsComponent } from './pages/wells-screen/active-wells/active-wells.component';
import { AppDocumentsActiveComponent } from './pages/releases/documents-active/documents-active.component';
import { CreateUserComponent } from './user-management/pages/create-user/create-user.component';
import { ObtainDataUserComponent } from './user-management/pages/obtain-data-user/obtain-data-user.component';
import { TestButtonUploadComponent } from './internalTests/button-upload/button-upload.component';
import { ElementHandlingComponent } from './organisms/element-handling/element-handling.component';
import { loadDescriptionComponent } from './molecules/validate-element-ITP/load-description/load-description.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

TestButtonUploadComponent;
const routes: Routes = [
  {
    path: 'test/button-upload',
    component: TestButtonUploadComponent,
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },

  //LAZY LOADING
  {
    path: 'quality1',
    loadChildren: () => import('../app/features/qaqc/qaqc.module').then(m => m.QaqcModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: 'signin',
    loadChildren: () => import('../app/features/signs/signs.module').then(m => m.SignsModule),
  },

  //NUEVO HOME
  {
    path: '',
    component: DashboardPageComponent,
    children: [
      {
        path: 'home',
        component: SharedHomeTemplateComponent,
        canActivate: [authGuard],
        data: {
          title: 'Home',
        },
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent,
        data: {
          title: 'Access Denied',
        },
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        data: {
          title: 'Build-In Notifications',
        },
      },
      {
        path: 'testing',
        component: SupportDocumentListComponent,
        pathMatch: 'full',
      },
      {
        path: 'wells',
        component: ActivePipesComponent,
        data: {
          title: 'Estado de Pozos',
          showHeader: true,
        },
      },
      {
        path: 'active', //Validado
        component: ActiveWellsComponent,
        data: {
          title: 'Activos del segmento',
          showHeader: true,
        },
      },
      {
        path: 'active/documents', //Validado
        component: AppDocumentsActiveComponent,
        data: {
          title: 'Documentos activos',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.releases.review.url, //Validado
        component: ReviewComponent,
        data: {
          title: 'En revisión',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.releases.qaqcReview.url, //Validado
        component: QAQCReviewComponent,
        data: {
          title: 'En revisión QAQC',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.releases.draft.url, //Validado
        component: DraftComponent,
        pathMatch: 'full',
        data: {
          title: 'En borrador',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.releases.support.url, //Validado
        component: SupportComponent,
        pathMatch: 'full',
        data: {
          title: 'Soporte/Ayuda',
          showHeader: true,
        },
      },

      {
        path: environment.frontEndpoints.releases.pecReview.url, //Validado
        component: PECReviewComponent,
        pathMatch: 'full',
        data: {
          title: 'En revisión PEC',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.releases.approved.url, //Validado
        component: ApprovedComponent,
        pathMatch: 'full',
        data: {
          title: 'En revisión PEC',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.releases.elements.url, //Validado
        component: ElementHandlingComponent,
        pathMatch: 'full',
        data: {
          title: 'Manejo de Elementos',
          showHeader: true,
        },
      }, //////////////////
      {
        path: environment.frontEndpoints.releases.validateDescription.url, //Validado
        component: loadDescriptionComponent,
        pathMatch: 'full',
        data: {
          title: 'Validación de descripción',
          showHeader: true,
        },
      },
      {
        path: `${environment.frontEndpoints.releases.draft.url}/edit`,
        component: WellInformationScreenComponent,
        data: {
          title: 'Cargar información de operación de pozo',
          showHeader: true,
        },
      },

      {
        path: 'logistic',
        component: LogisticHomePageComponent,
        canActivate: [authGuard],
        children: [
          {
            path: `oil-field-operations/update-information`,
            component: WellInformationScreenComponent,
            data: {
              title: 'Cargar información de operación de pozo',
              showHeader: true,
            },
          },
          {
            path: 'oil-field-operations/elements-pending',
            component: PendingChecksPageComponent,
            data: {
              title: 'Enviados esperando aprobación',
              showHeader: true,
            },
          },
          {
            path: 'oil-field-operations/elements-created',
            component: DraftsChecksPageComponent,
            data: {
              title: 'Enviados creados',
              showHeader: true,
            },
          },
          {
            path: 'oil-field-operations/elements-rejected',
            component: RejectedChecksPageComponent,
            data: {
              title: 'Enviados creados',
              showHeader: true,
            },
          },
          {
            path: 'oil-field-operations/check-element',
            component: CheckOilFieldOperationComponent,
            data: {
              title: 'Visualizar Operacion',
              showHeader: true,
            },
          },
        ],
      },

      //////////////////////////field module
      {
        path: 'app-field-home',
        component: FieldHomeComponent,
        data: {
          title: 'Estado de Pozos',
          showHeader: true,
        },
      },
      {
        path: 'app-field/:idOilFieldOperations',
        component: FieldComponent,
        data: {
          title: 'Gestión de pozo',
          showHeader: true,
        },
      },
      {
        path: 'app-field-activation-request',
        component: FieldActivationRequestComponent,
        data: {
          title: 'Solicitudes de activación',
          showHeader: true,
        },
      },
      {
        path: 'run-bes/:idOilfieldOperations',
        component: AppFieldRunBesComponent,
        data: {
          title: 'Run Bes',
          showHeader: true,
        },
      },

      {
        path: 'run-bes/:idWell',
        component: AppFieldRunBesComponent,
        data: {
          title: 'Run Bes',
          showHeader: true,
        },
      },
      //////////////////////////field module
      // Quality

      {
        path: 'quality/check-pendings',
        canActivate: [authGuard],

        component: PendingChecksScreenComponent,
        data: {
          title: 'Documentos por revisar',
          showHeader: true,
        },
      },
      {
        path: 'quality/pending-send',
        canActivate: [authGuard],

        component: SendToPECComponent,
        data: {
          title: 'Pendientes por enviar a PEC',
          showHeader: true,
        },
      },
      {
        path: 'quality/rejected',
        canActivate: [authGuard],

        component: RejectedWellSentInformationComponent,
        data: {
          title: 'Información rechazada',
          showHeader: true,
        },
      },
      {
        path: 'quality/approved',
        canActivate: [authGuard],

        component: ApprovedWellSentInformationComponent,
        data: {
          title: 'Información aprobada',
          showHeader: true,
        },
      },
      {
        path: 'quality/approved-information',
        canActivate: [authGuard],

        component: ShowQaqcApprovedRejectedInformationComponent,
        data: {
          title: 'Información',
          showHeader: true,
        },
      },
      {
        path: 'quality/approve-pending',
        canActivate: [authGuard],

        component: ApproveScreenComponent,
        data: {
          title: 'Aprobar Informacion',
          showHeader: true,
        },
      },
      {
        path: 'quality/pending-send/upload-files',
        canActivate: [authGuard],

        component: UploadSignFilesComponent,
        data: {
          title: 'Subir archivos',
          showHeader: true,
        },
      },
      //Segment
      {
        path: 'segment/approved-by-quality',
        component: ApprovedByQualityComponent,
        data: {
          title: 'Aprobado por QAQC',
          showHeader: true,
        },
      },
      {
        path: 'segment/approved-by-pec',
        component: ApprovedByPecComponent,
        data: {
          title: 'Aprobado por PEC',
          showHeader: true,
        },
      },

      // PEC
      {
        path: 'pec/pending-to-check',
        component: PendingToCheckComponent,
        data: {
          title: 'Pendientes por revisar',
          showHeader: true,
        },
      },
      {
        path: environment.frontEndpoints.privacy.url,
        component: PrivacyComponent,
        data: {
          title: 'Aviso de privacidad',
          showHeader: true,
        },
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'signs',
    loadChildren: () => import('./features/signs/signs.module').then(m => m.SignsModule),
  },
  {
    path: 'logistic',
    loadChildren: () => import('./features/logistic/logistic.module').then(m => m.LogisticModule),
  },
  {
    path: 'wellhead',
    component: DashboardPageComponent,
    loadChildren: () => import('./features/wellhead/wellhead.module').then(m => m.WellheadModule),
  },

  // Pages of User Management
  {
    path: 'create-user',
    component: CreateUserComponent,
  },
  {
    path: 'obtain-data-user',
    component: ObtainDataUserComponent,
    canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
