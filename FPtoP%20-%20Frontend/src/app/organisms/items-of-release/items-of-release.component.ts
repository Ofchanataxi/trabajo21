import { Input, Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogisticService } from '../../features/logistic/services/logistic.service';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';

@Component({
  selector: 'items-of-release',
  templateUrl: './items-of-release.component.html',
  styleUrls: ['./items-of-release.component.scss'],
})
export class ItemsOfReleaseComponent {
  constructor(
    private logisticService: LogisticService,
    private messageService: MessageService
  ) {}

  @Input() idReleaseState!: any;
  @Input() idBusinessLine!: any;
  @Input() itemsSteps!: any;
  @Input() title!: any;
  @Input() urlRedirect!: any;

  @ViewChild('errorDataLabel') errorDataMessage!: ElementRef;

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
    this.subscription = this.logisticService
      .getMetaDataReleasesByState(this.idReleaseState, this.idBusinessLine)
      .subscribe({
        next: (response: any) => {
          response = response.data;
          let arr = [];
          for (let i = 0; i < response.length; i++) {
            const element = response[i];
            
            let obj = {
              operationNumber: element.operationNumber,
              operationCode: element.operationCode,
              wellName: element.wellName,
              wellShortName: element.wellShortName,
              rigName: element.rigName,
              businessLineName: element.businessLineName,
              idBusinessLine: element.idBusinessLine,
              idNewReleaseState: element.idNewReleaseState,
              idPreviousState: element.idPreviousState,
              dateSent:
                element.lastChangedStateTimestamp !== null
                  ? element.lastChangedStateTimestamp
                  : '2024-01-01',
              firstName: element.firstName,
              lastName: element.lastName,
              email: element.email,
              idOilfieldOperations: element.idOilfieldOperations,
              idRelease: element.idRelease,
              updatedBy: element.firstName + ' ' + element.lastName,
              total_reviews: parseInt(element.total_reviews),
            };
            //   if (obj.firstName !== null) { // Significa que no se guardo con nuestro proceso
            //     arr.push(obj);
            //     }
            arr.push(obj);
          }
          this.approvedInformation = arr;
          this.approvedInformationFiltered = arr;
        },
        error: error => {
          this.errorDataMessage.nativeElement.style.display = 'block';
          this.messageService.add({
            severity: SlbSeverity.Error,
            summary: 'Error de conexión',
            detail: 'Hubo un error al obtener los datos',
          });
        },
      });
  }
}
