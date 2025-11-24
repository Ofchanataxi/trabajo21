import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WellsRoutingModule } from './wells-routing.module';
import { WellsHomePageComponent } from './pages/wells-home-page/wells-home-page.component';


@NgModule({
  declarations: [
    WellsHomePageComponent,
  ],
  imports: [
    CommonModule,
    WellsRoutingModule
  ],
  exports: [
    WellsHomePageComponent,
  ]
})
export class WellsModule { }
