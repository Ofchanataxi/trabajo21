import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DateRange } from "@angular/material/datepicker";
import { SlbDatePickerRangeComponent } from "@slb-dls/angular-material/date-range-picker";
import moment from 'moment';
import { DataService } from "src/app/services/pipe-information-service.service";
import { environment } from "../../../../environments/environment";
import { ApiService } from "../../../api.service";
import { Subscription } from "rxjs";
import { LoadingService } from "../../../loading.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-field-home",
  templateUrl: "./field-home.component.html",
  styleUrls: ["./field-home.component.scss"],
})
export class FieldHomeComponent {
  items: any[] = [];
  private subscription: Subscription;
  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  // Date Calendar variables
  minCalendarDate: moment.Moment;
  maxCalendarDate: moment.Moment;
  actualCalendarDate: moment.Moment = moment(new Date());
  @ViewChild("datepicker") dateRangePicker: SlbDatePickerRangeComponent<any>;
  dateRange = new FormControl();

  // Pipe information
  pipeInformationFiltered: any[] = [];
  pipeInformationFilteredText: any[] = [];
  searchingItems: any[] = [];

  pipeInformation: any = [];
  // Pipe information filtered by date
  startSelectDate: moment.Moment = moment("2024-06-24T16:31:27.522805+00");
  endSelectDate: moment.Moment = moment("2024-06-24T16:31:27.522805+00");

  ngOnInit(): void {
    this.subscription = this.apiService
      .getData(
        environment.apiBaseUrl + environment.endpoints.getAllWells.url,
        environment.endpoints.getAllWells.name
      )
      .subscribe({
        next: (response: any[]) => {
          let arr = [];
          for (let i = 0; i < response.length; i++) {
            const element = response[i];
            let obj = {
              viewText: `${element.itemName} ${
                element.joblogWoNumber === null
                  ? element.joblogType
                  : element.joblogType +
                    " #" +
                    element.joblogWoNumber +
                    " /" +
                    element.joblogWoEquip
              }`,
              value: i.toString(),
              activity: element.joblogActivity,
              lastDate: "2024-06-24T16:31:27.522805+00",
              status: element.status,
              engJoblogStartDate: element.engJoblogStartDate,
              engJoblogEndDate: element.engJoblogEndDate,
            };
            arr.push(obj);
            console.log(obj);
            
          }
          this.pipeInformation = arr;

          // Get max and min date
          if (this.pipeInformation.length > 0) {
            const maxDate = this.pipeInformation.reduce(
              (maxDate: number, current: { lastDate: number }) => {
                return current.lastDate > maxDate ? current.lastDate : maxDate;
              },
              this.pipeInformation[0].lastDate
            );

            const minDate = this.pipeInformation.reduce(
              (minDate: number, current: { lastDate: number }) => {
                return current.lastDate < minDate ? current.lastDate : minDate;
              },
              this.pipeInformation[0].lastDate
            );

            this.maxCalendarDate = moment(maxDate);
            this.minCalendarDate = moment(minDate);

            this.pipeInformationFiltered = this.pipeInformation.filter(
              (pipe: { lastDate: moment.MomentInput }) =>
                moment(pipe.lastDate)
                  .startOf("day")
                  .isSame(moment().startOf("day"))
            );
            this.pipeInformationFilteredText = this.pipeInformationFiltered;
            this.searchingItems = this.pipeInformationFiltered.map((pipe) => {
              return pipe.viewText;
            });

            this.searchingItems = this.pipeInformation;

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
    this.pipeInformationFiltered = this.pipeInformation.filter(
      (pipe: { lastDate: moment.MomentInput }) => {
        const pipeDate = moment(pipe.lastDate).startOf("day");
        return pipeDate.isBetween(startDate, endDate, undefined, "[]");
      }
    );
    this.searchingItems = this.pipeInformationFiltered.map((pipe) => {
      return pipe.viewText;
    });
    this.pipeInformationFilteredText = this.pipeInformationFiltered;
  }

  // Pipe information filtered by searching
  onSearchChange(event: string): void {
    this.pipeInformationFiltered = this.pipeInformationFilteredText;
    this.pipeInformationFiltered = this.pipeInformationFiltered.filter(
      (pipe) => {
        return String(pipe.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
  }

  onSearch(event: string): void {
    this.pipeInformationFiltered = this.pipeInformationFiltered.filter(
      (pipe) => {
        return String(pipe.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
    this.searchingItems = this.pipeInformationFiltered.map((pipe) => {
      return pipe.viewText;
    });
  }

  onSearchClear(event: any) {
    this.pipeInformationFiltered = this.pipeInformationFilteredText;
    this.searchingItems = this.pipeInformationFiltered.map((pipe) => {
      return pipe.viewText;
    });
  }

  onClearDate(): void {
    this.pipeInformationFiltered = this.pipeInformation.filter(
      (pipe: { lastDate: moment.MomentInput }) =>
        moment(pipe.lastDate).startOf("day").isSame(moment().startOf("day"))
    );
    this.searchingItems = this.pipeInformationFiltered.map((pipe) => {
      return pipe.viewText;
    });
    this.dateRange.reset();
  }

  toggleButton(id: number, param: string, route: string) {
    this.router.navigate([route], {
      queryParams: { idWell: id, nameWell: param },
    });
  }
}
