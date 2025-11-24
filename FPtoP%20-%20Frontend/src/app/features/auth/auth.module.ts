import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SLB_MOMENT_DATE_FORMATS, SLB_THEMING_OPTIONS } from '@slb-dls/angular-material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MessageService } from '@slb-dls/angular-material/notification';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/auth.interceptor';
import { LoadingInterceptor } from 'src/app/loading.interceptor';
import { LoadingService } from 'src/app/loading.service';
import { defaultColors } from '@slb-dls/angular-material/user-identity';
import { themeConfig } from 'src/themes/theme.config';
import { CallToActionButtonComponent } from './components/atoms/call-to-action-button/call-to-action-button.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';


const appearance: MatFormFieldDefaultOptions = {
  appearance: "outline",
};

const defaultColor = {
  color: "primary",
};

@NgModule({
  declarations: [
    CallToActionButtonComponent,
    LoginPageComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
  ],
  exports: [
  ],
  providers: [
    { provide: SLB_THEMING_OPTIONS, useValue: themeConfig },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: appearance },
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: defaultColors },
    { provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: defaultColors },
    { provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MessageService, useClass: MessageService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    LoadingService,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class AuthModule { }
