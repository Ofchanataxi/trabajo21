import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { Subscription } from "rxjs";
import { LogisticService } from "../../services/logistic.service";
import {
  MessageService,
  SlbSeverity
} from "@slb-dls/angular-material/notification";

@Component({
  selector: "logistic-approved-checks-page",
  templateUrl: "./approved-checks-page.component.html",
  styleUrls: ["./approved-checks-page.component.scss"],
})
export class ApprovedChecksPageComponent implements OnInit, OnDestroy {

  constructor(
    private logisticService: LogisticService,
    private messageService: MessageService
  ) {}

  @ViewChild("errorDataLabel") errorDataMessage!: ElementRef;

  approvedInformation: any = [];
  approvedInformationFiltered: any[] = [];
  private subscription: Subscription;
  
  ngOnInit(): void {

    this.subscription = this.logisticService.getMetaDataReleasesByState(2,1).subscribe({
      next: (response: any) => {
        response = response.data;
        let arr = [];
        for (let i = 0; i < response.length; i++) {
          const element = response[i];
          console.log('element');
          console.log(element);
          let obj = {
            "operationNumber": element.operationNumber,
            "operationCode": element.operationCode,
            "wellName": element.wellName,
            "wellShortName": element.wellShortName,
            "rigName": element.rigName,
            "businessLineName": element.businessLineName,
            "idBusinessLine": element.idBusinessLine,
            "idNewReleaseState": element.idNewReleaseState,
            "idPreviousState": element.idPreviousState,
            "dateSent": element.lastChangedStateTimestamp !== null ? element.lastChangedStateTimestamp : '2024-01-01',
            "firstName": element.firstName,
            "lastName": element.lastName,
            "email": element.email,
            "idOilfieldOperations": element.idOilfieldOperations,
            "idRelease": element.idRelease,
            "updatedBy": element.firstName+' '+element.lastName,
        }
          if (obj.firstName !== null) { // Significa que no se guardo con nuestro proceso
            arr.push(obj);
          }
          
        }
        this.approvedInformation = arr;
        this.approvedInformationFiltered = arr;

        
      },
      error: (error) => {
        this.errorDataMessage.nativeElement.style.display = "block";
        this.messageService.add({
          severity: SlbSeverity.Error,
          summary: "Error de conexión",
          detail: "Hubo un error al obtener los datos",
        });
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  updateItemsChange(newValue: any) {
    this.approvedInformationFiltered = newValue;
  }  
}
