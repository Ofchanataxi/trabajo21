import { Component, ContentChild, ElementRef, Input, QueryList, ViewChild, ViewEncapsulation } from '@angular/core';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { Subscription } from 'rxjs';
import { LogisticService } from 'src/app/features/logistic/services/logistic.service';

@Component({
  selector: 'app-custom-active-card',
  templateUrl: './custom-active-card.component.html',
  styleUrls: ['./custom-active-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomActiveCardComponent {
  constructor(
    private logisticService: LogisticService,
    private messageService: MessageService
  ) {}

    @Input() idReleaseState!: any;
    @Input() idBusinessLine!: any;
    @Input() itemsSteps!: any;
    @Input() title!: any;
    @Input() urlRedirect!: any;
  
    @ViewChild("errorDataLabel") errorDataMessage!: ElementRef;

    approvedInformation: any = [];
    approvedInformationFiltered: any[] = [];
    private subscription: Subscription;
    updateItemsChange(newValue: any) {
        this.approvedInformationFiltered = newValue;
    }
    ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    }

    ngOnInit(): void {

    this.subscription = this.logisticService.getMetaDataActiveWells().subscribe({
      next: (response: any) => {
        response = response.data;
        let arr = [];
        for (let i = 0; i < response.length; i++) {
          const element = response[i];  
          let obj = {
            idOilfieldOperations: element.operation_id,
            idOilfieldOperationsState: element.idOilfieldOperationsState,
            idOilfieldTypeOperations: element.idOilfieldTypeOperations,
            idRig: element.idRig,
            idWell: element.idWell,
            releaseCount: element.release_count,
            operationDescription: element.operationDescription,
            operation_state_name: element.operation_state_name,
            startDate: element.startDateTime,
            endDateTime: element.endDateTime,
            operationNumber: element.operationNumber,
            operationCode: element.operationCode,
            wellName: element.wellName,
            wellShortName: element.wellShortName,
            rigName: element.rig_name,
            operationType: element.operationType,
            dateSent: element.startDateTime != null
            ? element.startDateTime
            : '2024-01-01', 
          };
          arr.push(obj);
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
  
  filterByOperationState(isChecked: boolean): void {
    if (isChecked) {
      this.approvedInformationFiltered = this.approvedInformation.filter(
        (item: any) => item.operation_state_name === "Activo"
      );
    } else {
      this.approvedInformationFiltered = [...this.approvedInformation];
    }
    console.log("approvedInformationFiltered", this.approvedInformationFiltered); 
  }
  
}
