import { Component, ElementRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { LogisticService } from "../../services/logistic.service";
import { Router } from "@angular/router";
import {
  MessageService,
  SlbSeverity,
} from "@slb-dls/angular-material/notification";
import moment from 'moment';
import { SlbDatePickerRangeComponent } from "@slb-dls/angular-material/date-range-picker";
import { FormControl } from "@angular/forms";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-drafts-checks-page",
  templateUrl: "./drafts-checks-page.component.html",
  styleUrls: ["./drafts-checks-page.component.scss"],
})
export class DraftsChecksPageComponent {
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
  draftsInformation: any = [];
  draftsInformationFiltered: any[] = [];
  draftsInformationFilteredText: any[] = [];
  searchingItems: any[] = [];
  cardType: string = "draft";
  segmentId = environment.query.segment.ids.Logistic;

  // Burnt dates
  startSelectDate: moment.Moment;
  endSelectDate: moment.Moment;

  ngOnInit(): void {
    this.subscription = this.logisticService.getDraftsToCheck().subscribe({
      next: (response: any[]) => {
        let arr = [];
        for (let i = 0; i < response.length; i++) {
          const element = response[i];
          let obj = {
            id: element.oilFieldOpId,
            viewText: element.wellName,
            value: element.releaseId,
            madeBy: element.createBy.name,
            dateCreate: element.dateCreate,
            redirectionId: element.releaseId,
            redirecitionWellName: element.wellName,
          };
          arr.push(obj);
        }
        this.draftsInformation = arr;

        // Get max and min date
        if (this.draftsInformation.length > 0) {
          const maxDate = this.draftsInformation.reduce(
            (maxDate: number, current: { dateSent: number }) => {
              return current.dateSent > maxDate ? current.dateSent : maxDate;
            },
            this.draftsInformation[0].dateSent
          );

          const minDate = this.draftsInformation.reduce(
            (minDate: number, current: { dateSent: number }) => {
              return current.dateSent < minDate ? current.dateSent : minDate;
            },
            this.draftsInformation[0].dateSent
          );

          this.maxCalendarDate = moment(maxDate);
          this.minCalendarDate = moment(minDate);

          this.draftsInformationFiltered = this.draftsInformation.filter(
            (drafts: { dateSent: moment.MomentInput }) =>
              moment(drafts.dateSent)
                .startOf("day")
                .isSame(moment().startOf("day"))
          );
          this.draftsInformationFilteredText = this.draftsInformationFiltered;
          this.searchingItems = this.draftsInformationFiltered.map((drafts) => {
            return drafts.viewText;
          });

          this.searchingItems = this.draftsInformation;

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
    this.draftsInformationFiltered = this.draftsInformation.filter(
      (drafts: { dateSent: moment.MomentInput }) => {
        const draftsDate = moment(drafts.dateSent).startOf("day");
        return draftsDate.isBetween(startDate, endDate, undefined, "[]");
      }
    );
    this.searchingItems = this.draftsInformationFiltered.map((drafts) => {
      return drafts.viewText;
    });
    this.draftsInformationFilteredText = this.draftsInformationFiltered;
  }

  // Filter drafts information by searching
  onSearchChange(event: string): void {
    this.draftsInformationFiltered = this.draftsInformationFilteredText;
    this.draftsInformationFiltered = this.draftsInformationFiltered.filter(
      (drafts) => {
        return String(drafts.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
  }

  onSearch(event: string): void {
    this.draftsInformationFiltered = this.draftsInformationFiltered.filter(
      (drafts) => {
        return String(drafts.viewText)
          .toLowerCase()
          .includes(event.toLowerCase());
      }
    );
    this.searchingItems = this.draftsInformationFiltered.map((drafts) => {
      return drafts.viewText;
    });
  }

  onSearchClear(event: any) {
    this.draftsInformationFiltered = this.draftsInformationFilteredText;
    this.searchingItems = this.draftsInformationFiltered.map((drafts) => {
      return drafts.viewText;
    });
  }

  onClearDate(): void {
    this.draftsInformationFiltered = this.draftsInformation.filter(
      (drafts: { dateSent: moment.MomentInput }) =>
        moment(drafts.dateSent)
          .startOf("day")
          .isBetween(
            this.maxCalendarDate.startOf("day"),
            this.minCalendarDate.startOf("day")
          )
    );
    this.searchingItems = this.draftsInformationFiltered.map((drafts) => {
      return drafts.viewText;
    });
    this.dateRange.reset();
    this.filterByDate(
      this.minCalendarDate.startOf("day"),
      this.maxCalendarDate.startOf("day")
    );
  }

  toggleButton(id: number, param: string) {
    this.router.navigate(["/quality/approve-drafts"], {
      queryParams: { releaseId: id, nameWell: param },
    });
  }
}
