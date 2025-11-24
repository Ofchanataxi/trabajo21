import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PendingToCheckComponent } from "./pages/pending-to-check/pending-to-check.component";
import { SharedModule } from "src/app/shared/shared.module";
import { SLBModule } from "src/app/core/modules/slb.module";
import { MaterialModule } from "src/app/core/modules/material.module";
import { SlbSearchModule } from "@slb-dls/angular-material/search";

@NgModule({
  declarations: [PendingToCheckComponent],
  imports: [CommonModule, SharedModule, SlbSearchModule, SLBModule, MaterialModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PecModule {}
