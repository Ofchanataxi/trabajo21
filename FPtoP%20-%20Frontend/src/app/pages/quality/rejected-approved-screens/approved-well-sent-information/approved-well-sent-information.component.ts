import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { SlbDatePickerRangeComponent } from "@slb-dls/angular-material/date-range-picker";
import {
  MessageService,
  SlbSeverity,
} from "@slb-dls/angular-material/notification";
import moment from 'moment';
import { Subscription } from "rxjs";
import { QaqcService } from "src/app/features/qaqc/services/qaqc.service";

@Component({
  selector: "app-approved-well-sent-information",
  templateUrl: "./approved-well-sent-information.component.html",
  styleUrls: ["./approved-well-sent-information.component.scss"],
})
export class ApprovedWellSentInformationComponent implements OnInit, OnDestroy {
  items: any[] = [];
  private subscription: Subscription;
  constructor(
    private apiService: QaqcService,
    private router: Router,
    private messageService: MessageService
  ) {}

  // Date Calendar
  minCalendarDate: moment.Moment = moment(new Date());
  maxCalendarDate: moment.Moment = moment(new Date());
  actualCalendarDate: moment.Moment = moment(new Date());
  @ViewChild("datepicker") dateRangePicker: SlbDatePickerRangeComponent<any>;
  @ViewChild("noDataLabel") noDataMessage!: ElementRef;
  @ViewChild("errorDataLabel") errorDataMessage!: ElementRef;

  dateRange = new FormControl();

  // Pendings Information
  approvedInformation: any = [];
  approvedInformationFiltered: any[] = [];
  approvedInformationFilteredText: any[] = [];
  searchingItems: any[] = [];

  // Burnt dates
  startSelectDate: moment.Moment;
  endSelectDate: moment.Moment;

  ngOnInit(): void {
    this.subscription = this.apiService
      .getApprovedOilFieldOperations()
      .subscribe({
        next: (response: any[]) => {
          let arr = [];
          for (let i = 0; i < response.length; i++) {
            const element = response[i];
            let obj = {
              viewText: element.wellName,
              value: element.id,
              dateSent: element.dateUpdate,
            };
            arr.push(obj);
          }
          this.approvedInformation = arr;

          // Get max and min date
          if (this.approvedInformation.length > 0) {
            const maxDate = this.approvedInformation.reduce(
              (maxDate: number, current: { sent: number }) => {
                return current.sent > maxDate ? current.sent : maxDate;
              },
              this.approvedInformation[0].sent
            );

            const minDate = this.approvedInformation.reduce(
              (minDate: number, current: { sent: number }) => {
                return current.sent < minDate ? current.sent : minDate;
              },
              this.approvedInformation[0].sent
            );

            this.maxCalendarDate = moment(maxDate);
            this.minCalendarDate = moment(minDate);

            this.approvedInformationFiltered = this.approvedInformation.filter(
              (approved: { sent: moment.MomentInput }) =>
                moment(approved.sent)
                  .startOf("day")
                  .isSame(moment().startOf("day"))
            );
            this.approvedInformationFilteredText =
              this.approvedInformationFiltered;
            this.searchingItems = this.approvedInformationFiltered.map(
              (approved) => {
                return approved.viewText;
              }
            );

            this.searchingItems = this.approvedInformation;

            this.filterByDate(
              this.startSelectDate.startOf("day"),
              this.endSelectDate.startOf("day")
            );
          } else {
            this.noDataMessage.nativeElement.style.display = "block";
          }
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

  onDateSelected(event: any): void {
    if (event.startDate != null && event.endDate != null) {
      this.startSelectDate = event.startDate;
      this.endSelectDate = event.endDate;
      this.filterByDate(
        this.startSelectDate.startOf("day"),
        this.endSelectDate.startOf("day")
      );
    }
  }

  filterByDate(startDate: moment.Moment, endDate: moment.Moment): void {
    this.approvedInformationFiltered = this.approvedInformation.filter(
      (approved: { sent: moment.MomentInput }) => {
        const approvedDate = moment(approved.sent).startOf("day");
        return approvedDate.isBetween(startDate, endDate, undefined, "[]");
      }
    );
    this.searchingItems = this.approvedInformationFiltered.map((approved) => {
      return approved.viewText;
    });
    this.approvedInformationFilteredText = this.approvedInformationFiltered;
  }

  // Filter approved information by searching
  onSearchChange(event: string): void {
    this.approvedInformationFiltered = this.approvedInformationFilteredText;
    this.approvedInformationFiltered = this.approvedInformationFiltered.filter(
      (approved) => {
        return String(approved.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
  }

  onSearch(event: string): void {
    this.approvedInformationFiltered = this.approvedInformationFiltered.filter(
      (approved) => {
        return String(approved.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
    this.searchingItems = this.approvedInformationFiltered.map((approved) => {
      return approved.viewText;
    });
  }

  onSearchClear(event: any) {
    this.approvedInformationFiltered = this.approvedInformationFilteredText;
    this.searchingItems = this.approvedInformationFiltered.map((approved) => {
      return approved.viewText;
    });
  }

  onClearDate(): void {
    this.approvedInformationFiltered = this.approvedInformation.filter(
      (approved: { sent: moment.MomentInput }) =>
        moment(approved.sent).startOf("day").isSame(moment().startOf("day"))
    );
    this.searchingItems = this.approvedInformationFiltered.map((approved) => {
      return approved.viewText;
    });
    this.dateRange.reset();
  }

  toggleButton(id: number, param: string) {
    this.router.navigate(["/quality/approved-information"], {
      queryParams: { releaseId: id, nameWell: param, isRejected: false },
    });
  }
}
