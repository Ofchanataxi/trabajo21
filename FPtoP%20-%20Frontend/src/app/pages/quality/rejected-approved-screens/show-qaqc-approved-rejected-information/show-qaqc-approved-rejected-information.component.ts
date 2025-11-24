import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { QaqcServiceService } from "src/app/services/qaqc-service.service";

@Component({
  selector: "app-show-qaqc-approved-rejected-information",
  templateUrl: "./show-qaqc-approved-rejected-information.component.html",
  styleUrls: ["./show-qaqc-approved-rejected-information.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ShowQaqcApprovedRejectedInformationComponent {
  constructor(
    public cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private qaqcService: QaqcServiceService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      const idReleaseParam = params.get("releaseId");
      this.idRelease = idReleaseParam !== null ? +idReleaseParam : 0;
      const nameWellParam = params.get("nameWell");
      this.isRejected = params.get("isRejected") === "true";
      this.nameWell =
        nameWellParam !== null ? nameWellParam : "ERROR AL CARGAR INFORMACION";
    });

    this.qaqcService.getElementsRelease(this.idRelease).subscribe({
      next: (response: any) => {
        this.pendingInformation = response;
        this.isFetchData = true;
      },
      complete() {},
      error: (error) => {},
    });
  }

  completedSteps: boolean[] = [];
  pendingInformation: {};
  isFetchData: boolean = false;
  isRejected: boolean;

  async ngOnInit(): Promise<void> {
    this.completedSteps = [false, false];
  }

  nameWell: string;
  idRelease: number;
  private subscription: Subscription;

  @ViewChild("stepper") stepper: MatStepper;
  selectionChange(event: any): void {
    if (this.completedSteps[event.selectedIndex]) {
      for (let i = event.selectedIndex; i < this.stepper.steps.length; i++) {
        this.completedSteps[i] = false;
        this.stepper.steps.get(i)!.editable = true;
      }
    }
  }

  stepperNext(event: any) {
    this.cdRef.detectChanges();
    this.stepper.next();
  }

  receiveCompletedSteps(data: boolean[]) {
    this.completedSteps = data;
  }
}
