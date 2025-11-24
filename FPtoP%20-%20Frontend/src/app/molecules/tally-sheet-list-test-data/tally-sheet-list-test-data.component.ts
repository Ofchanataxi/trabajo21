import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'logistic-tally-sheet-list-test-data',
  templateUrl: './tally-sheet-list-test-data.component.html',
  styles: [
  ],
})
export class TallySheetListTestDataComponent {
  @Input() rowData!: any[]; // El padre puede modificar esta propiedad
  @Input() testDataList: any[];
  @Output() updateRowWithTestDataEvent = new EventEmitter<any[]>();

  addTestData(data: Object[]) {
    this.rowData = data;
    this.updateRowWithTestDataEvent.emit(this.rowData);
  }


}
