import { Component, Input, Output, OnInit, EventEmitter, SimpleChanges } from '@angular/core';
import { StepService } from '../../../services/step.service'; // Adjust the path as necessary
import { GenericRequestPageComponent } from '../../../generic-request-page/generic-request-page.component';

@Component({
  selector: 'app-field-step-three',
  templateUrl: './field-step-03.component.html',
  styleUrls: ['./field-step-03.component.scss'],
})
export class FieldStepThreeComponent {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;
  @Input() updatedFields: { 
    tableName: string; 
    fieldName: string; 
    idRow: string; 
    newValue: any;
    idOilfieldOperations: string;
    tally_id: string;
    idElementRelease: string;
    groupid: string;
    group: string;
    }[] = [];

  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  @Output() groupedDataChange = new EventEmitter<any>();
  @Output() parentAction = new EventEmitter<string>;

  @Output() updatedFieldsChange = new EventEmitter<
  { 
    tableName: string; 
    fieldName: string; 
    idRow: string; 
    newValue: any;
    idOilfieldOperations: string;
    tally_id: string;
    idElementRelease: string;
    groupid: string;
    }[]
>();
  table: string;
  index: number =1;
  searchTerm: string = '';
  filteredData: { [key: string]: any[] };
  searchTermTable1: string = '';
  searchTermTable2: string = '';
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.groupedData) {
      this.filteredData = { ...this.groupedData };
      console.log('Grouped data in step one changed:', this.groupedData);
    }
  }
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getColumnKeys(group: string, table: string): string[] {
    return this.groupedData[group] && this.groupedData[group].length > 0
      ? Object.keys(this.groupedData[group][0]).filter(key => key !== 'columnA')
      : [];
  }

  onSearchChange(event: any) {
    this.searchChange.emit(event);
    this.searchTerm = event;
  }

  onSearch(event: any) {
    this.search.emit(event);
  }

  onSearchClear(event: any) {
    this.searchClear.emit(event);
    this.filteredData = { ...this.groupedData };
  }
  onSearchChangeTable1(event: any) {
    this.searchChange.emit(event);
    console.log("search1",event)
    this.searchTermTable1 = event;
  }

  onSearchChangeTable2(event: any) {
    this.searchChange.emit(event);
    console.log("search2",event)
    this.searchTermTable2 = event;
  }

  onSearchClearTable1(event: any) {
    this.searchClear.emit(event);
    this.filteredData = { ...this.groupedData };
    this.searchTermTable1 = '';
  }

  onSearchClearTable2(event: any) {
    this.searchClear.emit(event);
    this.filteredData = { ...this.groupedData };
    this.searchTermTable2 = '';
  }
  getColumnType(table: string, columnKey: string): string {
    return this.columnConfig[table][columnKey]?.type || 'text';
  }

  getColumnLabel(table: string, columnKey: string): string {
    return this.columnConfig[table][columnKey]?.label || '';
  }
  onRowUpdated(event: { item: any, groupKey: string }): void {
    const updatedGroupedData = { ...this.groupedData };
    this.groupedData = updatedGroupedData
    this.groupedDataChange.emit(updatedGroupedData);
    console.log('Row updated:', event);

   
  }

  

isGroupedDataEmpty(): boolean {
  
  if (!this.groupedData || typeof this.groupedData !== 'object') {
    return true; // groupedData no está definido o no es un objeto
  }

  // Combina todos los arreglos dentro de groupedData
  const allItems = Object.values(this.groupedData).flat();

  // Calcula la suma de CatidadEnPozo
  const suma = allItems.reduce((acc: number, item: any) => acc + (item["ElementTally.quantity"] || 0), 0);
  return suma === 0;
}
handleAction(action: string){
  console.log("handleAction field step 03", action)
  this.parentAction.emit(action);
}
passIndex(index: any){
  console.log('passIndex1', index)
  //this.index = index
}
}