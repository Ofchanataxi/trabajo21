import { Component, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import {
  MessageService,
  SlbSeverity,
} from "@slb-dls/angular-material/notification";
import { ButtonRarUploadComponent } from "src/app/atoms/button-rar-upload/button-rar-upload.component";
import { WellInformationService } from "src/app/pages/field/services/well-information.service";

@Component({
  selector: "app-show-signs-information",
  templateUrl: "./show-signs-information.component.html",
  styleUrls: ["./show-signs-information.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ShowSignsInformationComponent {
  constructor(
    private router: Router,
    private wellInformationService: WellInformationService,
    private messageService: MessageService
  ) {}

  @Input() pendingInformation: { [key: string]: any } = {};
  @Input() isRejected: boolean;
  @ViewChild("signedITPFile") signedITPFile: ButtonRarUploadComponent;

  fileExample: File = new File(
    [
      new Blob(["Este es el contenido del archivo."], {
        type: "application/pdf",
      }),
    ],
    "file.pdf",
    {
      type: "application/pdf",
      lastModified: new Date().getTime(),
    }
  );

  toggleButton(id: number, param: string) {
    if (this.isRejected) {
      this.router.navigate(["/quality/rejected"], {});
    } else {
      this.router.navigate(["/quality/approved"], {});
    }
  }
}
