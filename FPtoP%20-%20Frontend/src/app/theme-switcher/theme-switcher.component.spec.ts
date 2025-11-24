import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SlbNavigationFrameworkModule } from '@slb-dls/angular-material/navigation-framework';
import { SlbBreadcrumbsModule } from '@slb-dls/angular-material/breadcrumbs';

import { ThemeSwitcherComponent } from './theme-switcher.component';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        MatIconModule,
        MatSlideToggleModule,

        SlbBreadcrumbsModule,
        SlbButtonModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ThemeSwitcherComponent],
    })
      .compileComponents();
  });

  beforeEach(inject([MatIconRegistry, DomSanitizer], (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => {
    iconRegistry.addSvgIconSet(
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg-symbols.svg')
    );
    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
