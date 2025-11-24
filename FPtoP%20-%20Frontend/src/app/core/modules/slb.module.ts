import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { SlbButtonModule } from "@slb-dls/angular-material/button";
import { SlbFormFieldModule } from "@slb-dls/angular-material/form-field";
import { SlbPopoverModule } from "@slb-dls/angular-material/popover";
import { SlbNotificationModule } from "@slb-dls/angular-material/notification";
import { SlbNotificationsPanelModule } from "@slb-dls/angular-material/notifications-panel";
import { SlbNavigationFrameworkModule } from "@slb-dls/angular-material/navigation-framework";
import { SlbBreadcrumbsModule } from "@slb-dls/angular-material/breadcrumbs";
import { SlbDropzoneModule } from "@slb-dls/angular-material/dropzone";
import { SlbDropdownModule } from "@slb-dls/angular-material/dropdown";
import { SlbSharedModule } from "@slb-dls/angular-material/shared";
import { SlbSearchModule } from "@slb-dls/angular-material/search";
import { SlbDatePickerRangeModule } from "@slb-dls/angular-material/date-range-picker";
import { SlbBadgeModule } from "@slb-dls/angular-material/badge";
import { SlbModalModule } from "@slb-dls/angular-material/modal";
import { SlbLoginModule } from "@slb-dls/angular-material/login";
import { SlbUserIdentityModule } from "@slb-dls/angular-material/user-identity";
import { SlbLogoutModule } from "@slb-dls/angular-material/logout";
import { SlbRadioButtonGroupModule } from "@slb-dls/angular-material/radio-button-group";
@NgModule({
  imports: [CommonModule, MatIconModule],
  exports: [
    SlbSharedModule,
    SlbButtonModule,
    SlbFormFieldModule,
    SlbPopoverModule,
    SlbNotificationModule,
    SlbNotificationsPanelModule,
    SlbNavigationFrameworkModule,
    SlbBreadcrumbsModule,
    SlbDropzoneModule,
    SlbDropdownModule,
    SlbSearchModule,
    SlbDatePickerRangeModule,
    SlbBadgeModule,
    SlbModalModule,
    SlbLoginModule,
    SlbUserIdentityModule,
    SlbLogoutModule,
    SlbRadioButtonGroupModule,
  ],
  declarations: [],
  providers: [],
})
export class SLBModule {}
