import { Component, Input,Output, OnInit, EventEmitter } from '@angular/core';
import { StepService } from '../../../services/step.service'; 

@Component({
  selector: 'app-field-step-six',
  templateUrl: './field-step-06.component.html',
  styleUrls: ['./field-step-06.component.scss'],
})
export class FieldStepSixComponent {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;
  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getColumnKeys(group: string): string[] {
    return this.groupedData[group] && this.groupedData[group].length > 0
      ? Object.keys(this.groupedData[group][0]).filter(key => key !== 'columnA')
      : [];
  }

  onSearchChange(event: any) {
    this.searchChange.emit(event);
  }

  onSearch(event: any) {
    this.search.emit(event);
  }

  onSearchClear(event: any) {
    this.searchClear.emit(event);
  }

  getColumnType(columnKey: string): string {
    return this.columnConfig[columnKey]?.type || 'text';
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig[columnKey]?.label || '';
  }
}



