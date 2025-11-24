import {
    Input,
    Component,
    Output,
    EventEmitter
} from "@angular/core";
import moment from 'moment';
import { FormControl } from "@angular/forms";

@Component({
  selector: 'search-by-date',
  templateUrl: './search-by-date.component.html',
  styleUrls: ['./search-by-date.component.scss'],
})
export class SearchByDateComponent { 
  @Input() originalItems!: any;
  @Output() itemsChange = new EventEmitter();
startSelectDate: moment.Moment;
  endSelectDate: moment.Moment;
  dateRange = new FormControl();
  minCalendarDate: moment.Moment = moment('0001-01-01T00:00:00Z');
  maxCalendarDate: moment.Moment = moment(new Date());
  actualCalendarDate: moment.Moment = moment(new Date());
  
  filterByDate(startDate: moment.Moment, endDate: moment.Moment): void {
    const filteredData = this.originalItems.filter(
      (item: { dateSent: moment.MomentInput }) => {
        const momentItemDate = moment(item.dateSent).startOf("day");
        return momentItemDate.isBetween(startDate, endDate, undefined, "[]");
      }
    );
    this.itemsChange.emit(filteredData);
  }
    
  onDateSelected(event: any): void {
    if (event.startDate != null && event.endDate != null) {
      const momentStartDate = moment(event.startDate).startOf("day");
      const momentEndtDate = moment(event.endDate).endOf("day");
      this.filterByDate(
        momentStartDate,
        momentEndtDate
      );
    }
  }

  onClearDate(): void {
    this.itemsChange.emit(this.originalItems);
    this.dateRange.reset(); 
  }
    
}