import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { HelloWorldComponent } from './components/atoms/hello-world/hello-world.component';


@NgModule({
  declarations: [
    HelloWorldComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  exports: [
  HelloWorldComponent
  ]
})
export class AdminModule { }
