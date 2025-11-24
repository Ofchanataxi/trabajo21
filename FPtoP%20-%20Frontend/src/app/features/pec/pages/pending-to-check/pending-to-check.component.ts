import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SlbDatePickerRangeComponent } from '@slb-dls/angular-material/date-range-picker';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { PecServiceService } from '../../services/pec-service.service';

@Component({
  selector: 'pec-pending-to-check',
  templateUrl: './pending-to-check.component.html',
  styleUrls: ['./pending-to-check.component.scss'],
})
export class PendingToCheckComponent implements OnInit, OnDestroy {
  items: any[] = [];
  private subscription: Subscription;
  constructor(
    private pecService: PecServiceService,
    private router: Router
  ) {}

  // Date Calendar
  minCalendarDate: moment.Moment;
  maxCalendarDate: moment.Moment;
  actualCalendarDate: moment.Moment = moment(new Date());
  @ViewChild("datepicker") dateRangePicker: SlbDatePickerRangeComponent<any>;
  dateRange = new FormControl();

  // Pendings Information
  pendingInformation: any = [];
  pendingInformationFiltered: any[] = [];
  pendingInformationFilteredText: any[] = [];
  searchingItems: any[] = [];

  // Burnt dates
  startSelectDate: moment.Moment = moment("2024-06-24T16:31:27.522805+00");
  endSelectDate: moment.Moment = moment("2024-06-24T16:31:27.522805+00");

  ngOnInit(): void {
    this.subscription = this.pecService.getPendingToCheck().subscribe({
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
        }
      },
      error: (error) => {},
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
