import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogisticService } from '../../services/logistic.service';
import { Router } from '@angular/router';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import moment from 'moment';
import { SlbDatePickerRangeComponent } from '@slb-dls/angular-material/date-range-picker';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rejected-checks-page',
  templateUrl: './rejected-checks-page.component.html',
  styleUrls: ['./rejected-checks-page.component.scss']
})
export class RejectedChecksPageComponent  implements OnInit, OnDestroy {
  items: any[] = [];
  private subscription: Subscription;
  constructor(
    private logisticService: LogisticService,
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
  cardType: string = "rejected";
  segmentId = environment.query.segment.ids.Logistic;

  // Burnt dates
  startSelectDate: moment.Moment;
  endSelectDate: moment.Moment;

  ngOnInit(): void {
    this.subscription = this.logisticService.getRejectedToCheck().subscribe({
      next: (response: any[]) => {
        let arr = [];
        for (let i = 0; i < response.length; i++) {
          const element = response[i];
          let obj = {
            id: element.oilFieldOpId,
            viewText: element.wellName,
            value: element.releaseId,
            madeBy: element.madeBy.name,
            updateBy: element.updateBy,
            dateSent: element.dateUpdate,
            businessLine: element.updateBy.belongsGroups[0],
          };
          arr.push(obj);
        }
        this.rejectedInformation = arr;

        // Get max and min date
        if (this.rejectedInformation.length > 0) {
          const maxDate = this.rejectedInformation.reduce(
            (maxDate: number, current: { dateSent: number }) => {
              return current.dateSent > maxDate ? current.dateSent : maxDate;
            },
            this.rejectedInformation[0].dateSent
          );

          const minDate = this.rejectedInformation.reduce(
            (minDate: number, current: { dateSent: number }) => {
              return current.dateSent < minDate ? current.dateSent : minDate;
            },
            this.rejectedInformation[0].dateSent
          );

          this.maxCalendarDate = moment(maxDate);
          this.minCalendarDate = moment(minDate);

          this.rejectedInformationFiltered = this.rejectedInformation.filter(
            (rejected: { dateSent: moment.MomentInput }) =>
              moment(rejected.dateSent)
                .startOf("day")
                .isSame(moment().startOf("day"))
          );
          this.rejectedInformationFilteredText = this.rejectedInformationFiltered;
          this.searchingItems = this.rejectedInformationFiltered.map(
            (rejected) => {
              return rejected.viewText;
            }
          );

          this.searchingItems = this.rejectedInformation;

          this.filterByDate(
            this.minCalendarDate.startOf("day"),
            this.maxCalendarDate.startOf("day")
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
      (rejected: { dateSent: moment.MomentInput }) => {
        const rejectedDate = moment(rejected.dateSent).startOf("day");
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
      (rejected: { dateSent: moment.MomentInput }) =>
        moment(rejected.dateSent)
          .startOf("day")
          .isBetween(
            this.maxCalendarDate.startOf("day"),
            this.minCalendarDate.startOf("day")
          )
    );
    this.searchingItems = this.rejectedInformationFiltered.map((rejected) => {
      return rejected.viewText;
    });
    this.dateRange.reset();
    this.filterByDate(
      this.minCalendarDate.startOf("day"),
      this.maxCalendarDate.startOf("day")
    );
  }
}
