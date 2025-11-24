import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { SLBModule } from 'src/app/core/modules/slb.module';
import { WellheadRoutingModule } from './wellhead-routing.module';
import { WellheadHomePageComponent } from './pages/wellhead-home-page/wellhead-home-page.component';
import { WellheadActiveWellsPageComponent } from './pages/wellhead-active-wells-page/wellhead-active-wells-page.component';



@NgModule({
  declarations: [
    WellheadHomePageComponent,
    WellheadActiveWellsPageComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    SLBModule,
    WellheadRoutingModule,
  ],
})
export class WellheadModule { }
