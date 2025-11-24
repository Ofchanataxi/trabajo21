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
  selector: "app-rejected-well-rejectSent-information",
  templateUrl: "./rejected-well-sent-information.component.html",
  styleUrls: ["./rejected-well-sent-information.component.scss"],
})
export class RejectedWellSentInformationComponent implements OnInit, OnDestroy {
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
  rejectedInformation: any = [];
  rejectedInformationFiltered: any[] = [];
  rejectedInformationFilteredText: any[] = [];
  searchingItems: any[] = [];

  // Burnt dates
  startSelectDate: moment.Moment;
  endSelectDate: moment.Moment;

  ngOnInit(): void {
    this.subscription = this.apiService
      .getRejectedOilFieldOperations()
      .subscribe({
        next: (response: any[]) => {
          let arr = [];
          for (let i = 0; i < response.length; i++) {
            const element = response[i];
            let obj = {
              id: element.id,
              viewText: element.wellName,
              value: element.releaseId,
              madeBy: element.updateBy,
              dateSent: element.dateUpdate,
              other: element.bussinessLine,
              rejectReason: element.rejectReason,
            };
            arr.push(obj);
          }
          this.rejectedInformation = arr;

          // Get max and min date
          if (this.rejectedInformation.length > 0) {
            const maxDate = this.rejectedInformation.reduce(
              (maxDate: number, current: { rejectSent: number }) => {
                return current.rejectSent > maxDate
                  ? current.rejectSent
                  : maxDate;
              },
              this.rejectedInformation[0].rejectSent
            );

            const minDate = this.rejectedInformation.reduce(
              (minDate: number, current: { rejectSent: number }) => {
                return current.rejectSent < minDate
                  ? current.rejectSent
                  : minDate;
              },
              this.rejectedInformation[0].rejectSent
            );

            this.maxCalendarDate = moment(maxDate);
            this.minCalendarDate = moment(minDate);

            this.rejectedInformationFiltered = this.rejectedInformation.filter(
              (rejected: { rejectSent: moment.MomentInput }) =>
                moment(rejected.rejectSent)
                  .startOf("day")
                  .isSame(moment().startOf("day"))
            );
            this.rejectedInformationFilteredText =
              this.rejectedInformationFiltered;
            this.searchingItems = this.rejectedInformationFiltered.map(
              (rejected) => {
                return rejected.viewText;
              }
            );

            this.searchingItems = this.rejectedInformation;

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
    this.rejectedInformationFiltered = this.rejectedInformation.filter(
      (rejected: { rejectSent: moment.MomentInput }) => {
        const rejectedDate = moment(rejected.rejectSent).startOf("day");
        return rejectedDate.isBetween(startDate, endDate, undefined, "[]");
      }
    );
    this.searchingItems = this.rejectedInformationFiltered.map((rejected) => {
      return rejected.viewText;
    });
    this.rejectedInformationFilteredText = this.rejectedInformationFiltered;
  }

  // Filter rejected information by searching
  onSearchChange(event: string): void {
    this.rejectedInformationFiltered = this.rejectedInformationFilteredText;
    this.rejectedInformationFiltered = this.rejectedInformationFiltered.filter(
      (rejected) => {
        return String(rejected.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
  }

  onSearch(event: string): void {
    this.rejectedInformationFiltered = this.rejectedInformationFiltered.filter(
      (rejected) => {
        return String(rejected.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
    this.searchingItems = this.rejectedInformationFiltered.map((rejected) => {
      return rejected.viewText;
    });
  }

  onSearchClear(event: any) {
    this.rejectedInformationFiltered = this.rejectedInformationFilteredText;
    this.searchingItems = this.rejectedInformationFiltered.map((rejected) => {
      return rejected.viewText;
    });
  }

  onClearDate(): void {
    this.rejectedInformationFiltered = this.rejectedInformation.filter(
      (rejected: { rejectSent: moment.MomentInput }) =>
        moment(rejected.rejectSent)
          .startOf("day")
          .isSame(moment().startOf("day"))
    );
    this.searchingItems = this.rejectedInformationFiltered.map((rejected) => {
      return rejected.viewText;
    });
    this.dateRange.reset();
  }

  toggleButton(id: number, param: string) {
    this.router.navigate(["/quality/approved-information"], {
      queryParams: { idWell: id, nameWell: param, isRejected: true },
    });
  }
}
