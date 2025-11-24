import { TestBed, inject, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { SlbNavigationFrameworkModule } from '@slb-dls/angular-material/navigation-framework';
import { MessageService, SlbNotificationModule } from '@slb-dls/angular-material/notification';
import { SlbSharedModule } from '@slb-dls/angular-material/shared';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbNotificationsPanelModule } from '@slb-dls/angular-material/notifications-panel';
import { SlbBreadcrumbsModule } from '@slb-dls/angular-material/breadcrumbs';
import { SlbLogoutModule } from '@slb-dls/angular-material/logout';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        RouterTestingModule,
        FormsModule,

        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatMenuModule,
        MatSlideToggleModule,

        SlbSharedModule,
        SlbButtonModule,
        SlbNotificationModule,
        SlbNotificationsPanelModule,
        SlbNavigationFrameworkModule,
        SlbBreadcrumbsModule,
        SlbLogoutModule,
      ],
      declarations: [
        AppComponent,
      ],
      providers: [MessageService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(inject([MatIconRegistry, DomSanitizer], (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => {
    iconRegistry.addSvgIconSet(
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg-symbols.svg')
    );
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

});
