import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogisticRoutingModule } from './logistic-routing.module';
import { PendingChecksPageComponent } from './pages/pending-checks-page/pending-checks-page.component';
import { LogisticHomePageComponent } from './pages/logistic-home-page/logistic-home-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DraftsChecksPageComponent } from './pages/drafts-checks-page/drafts-checks-page.component';
import { ApprovedChecksPageComponent } from './pages/approved-checks-page/approved-checks-page.component';
import { RejectedChecksPageComponent } from './pages/rejected-checks-page/rejected-checks-page.component';
import { LogisticService } from './services/logistic.service';
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from '@angular/material/icon';
import { SLBModule } from 'src/app/core/modules/slb.module';
import { MaterialModule } from 'src/app/core/modules/material.module';


@NgModule({
  declarations: [
    PendingChecksPageComponent,
    LogisticHomePageComponent,
    DraftsChecksPageComponent,
    ApprovedChecksPageComponent,
    RejectedChecksPageComponent,
  ],
  imports: [
    CommonModule,
    LogisticRoutingModule,
    SharedModule,
    SLBModule,
    MaterialModule,
    MatListModule,
    MatIconModule,
  ],
  providers: [
    LogisticService,
  ],
})
export class LogisticModule { }
