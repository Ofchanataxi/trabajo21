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
import { QaqcServiceService } from "src/app/services/qaqc-service.service";

@Component({
  selector: "app-pending-checks-screen",
  templateUrl: "./pending-checks-screen.component.html",
  styleUrls: ["./pending-checks-screen.component.scss"],
})
export class PendingChecksScreenComponent implements OnInit, OnDestroy {
  items: any[] = [];
  private subscription: Subscription;
  constructor(
    private qaqcService: QaqcServiceService,
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
  pendingInformation: any = [];
  pendingInformationFiltered: any[] = [];
  pendingInformationFilteredText: any[] = [];
  searchingItems: any[] = [];

  // Burnt dates
  startSelectDate: moment.Moment;
  endSelectDate: moment.Moment;

  ngOnInit(): void {
    this.subscription = this.qaqcService.getPendingToCheck().subscribe({
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
          };
          arr.push(obj);
        }
        this.pendingInformation = arr;

        // Get max and min date
        if (this.pendingInformation.length > 0) {
          const maxDate = this.pendingInformation.reduce(
            (maxDate: number, current: { dateSent: number }) => {
              return current.dateSent > maxDate ? current.dateSent : maxDate;
            },
            this.pendingInformation[0].dateSent
          );

          const minDate = this.pendingInformation.reduce(
            (minDate: number, current: { dateSent: number }) => {
              return current.dateSent < minDate ? current.dateSent : minDate;
            },
            this.pendingInformation[0].dateSent
          );

          this.maxCalendarDate = moment(maxDate);
          this.minCalendarDate = moment(minDate);

          this.pendingInformationFiltered = this.pendingInformation.filter(
            (pending: { dateSent: moment.MomentInput }) =>
              moment(pending.dateSent)
                .startOf("day")
                .isSame(moment().startOf("day"))
          );
          this.pendingInformationFilteredText = this.pendingInformationFiltered;
          this.searchingItems = this.pendingInformationFiltered.map(
            (pending) => {
              return pending.viewText;
            }
          );

          this.searchingItems = this.pendingInformation;

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
    this.pendingInformationFiltered = this.pendingInformation.filter(
      (pending: { dateSent: moment.MomentInput }) => {
        const pendingDate = moment(pending.dateSent).startOf("day");
        return pendingDate.isBetween(startDate, endDate, undefined, "[]");
      }
    );
    this.searchingItems = this.pendingInformationFiltered.map((pending) => {
      return pending.viewText;
    });
    this.pendingInformationFilteredText = this.pendingInformationFiltered;
  }

  // Filter pending information by searching
  onSearchChange(event: string): void {
    this.pendingInformationFiltered = this.pendingInformationFilteredText;
    this.pendingInformationFiltered = this.pendingInformationFiltered.filter(
      (pending) => {
        return String(pending.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
  }

  onSearch(event: string): void {
    this.pendingInformationFiltered = this.pendingInformationFiltered.filter(
      (pending) => {
        return String(pending.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
    this.searchingItems = this.pendingInformationFiltered.map((pending) => {
      return pending.viewText;
    });
  }

  onSearchClear(event: any) {
    this.pendingInformationFiltered = this.pendingInformationFilteredText;
    this.searchingItems = this.pendingInformationFiltered.map((pending) => {
      return pending.viewText;
    });
  }

  onClearDate(): void {
    this.pendingInformationFiltered = this.pendingInformation.filter(
      (pending: { dateSent: moment.MomentInput }) =>
        moment(pending.dateSent).startOf("day").isSame(moment().startOf("day"))
    );
    this.searchingItems = this.pendingInformationFiltered.map((pending) => {
      return pending.viewText;
    });
    this.dateRange.reset();
  }

  toggleButton(id: number, param: string) {
    this.router.navigate(["/quality/approve-pending"], {
      queryParams: { releaseId: id, nameWell: param },
    });
  }
}
