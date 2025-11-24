import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RejectReleaseDialogComponent } from './components/templates/reject-release-dialog/reject-release-dialog.component';
import { QaqcService } from './services/qaqc.service';
import { QaqcRoutingModule } from './qaqc-routing.module';
import { HelloComponent } from './components/atoms/hello/hello.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { QaqcHomePageComponent } from './pages/qaqc-home-page/qaqc-home-page.component';



@NgModule({
  declarations: [
    RejectReleaseDialogComponent,
    HelloComponent,
    QaqcHomePageComponent,
  ],
  imports: [
    //ANGULAR
    CommonModule,
    QaqcRoutingModule,

  ],
  providers: [
    QaqcService
  ]
})
export class QaqcModule { }
