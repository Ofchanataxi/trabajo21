import { Component, Input, Output, OnInit, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { DynamicTableComponent } from '../../dynamic-table/dynamic-table.component';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

@Component({
  selector: "app-field-step-two",
  templateUrl: "./field-step-02.component.html",
  styleUrls: ["./field-step-02.component.scss"],
})
export class FieldStepTwoComponent {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;
  @Input() well: any;
  @Input() user: string;
  @Input() updatedFields: { 
    tableName: string; 
    fieldName: string; 
    idRow: string; 
    newValue: any;
    idOilfieldOperations: string;
    tally_id: string;
    idElementRelease: string;
    groupid: string;
    sequence_number: any;
    }[] = [];


  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  @Output() rejectedEquipmentChange = new EventEmitter<any>();
  
  observations: string; 
  rejectedRow: any;


  searchTerm: string = "";
  filteredData: { [key: string]: any[] };
  rechazoConfirmado: boolean = false;
  
  checkboxChecked: boolean = false; 
  @ViewChild('dynamicTable') dynamicTable!: DynamicTableComponent;

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
    sequence_number: any;
    }[]
>();

  @Output() parentAction = new EventEmitter<string>;



  constructor(
    private notificationService : NotificationsService,
  ) {}

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.groupedData) {
      this.filteredData = { ...this.groupedData };
      console.log("Grouped data in step one changed:", this.groupedData);
    }
  }

  getColumnKeys(group: string): string[] {
    return this.groupedData[group] && this.groupedData[group].length > 0
      ? Object.keys(this.groupedData[group][0]).filter(
          (key) => key !== "columnA"
        )
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

  onRejectedEquipmentChange(event: any){
    this.rejectedEquipmentChange.emit(event);
    console.log('onRejectedEquipmentChange', event)
  }
  getColumnType(columnKey: string): string {
    return this.columnConfig[columnKey]?.type || "text";
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig[columnKey]?.label || "";
  }

  
  
onUpdatedFieldsChange(updatedFields: { 
  tableName: string; 
  fieldName: string; 
  idRow: string; 
  newValue: any;
  idOilfieldOperations: string;
  tally_id: string;
  idElementRelease: string;
  groupid: string;
  sequence_number: any;
  }[]): void {
  console.log('Propagating Updated Fields from Step 3:', updatedFields);
  this.updatedFieldsChange.emit(updatedFields); // Re-emit the event
}

addSeccionRow(){

}
handleAction(action: string){
  console.log("handleAction field step 02", action)
  this.parentAction.emit(action);
}
onRejectConfirmed() {
 const row = this.dynamicTable.onRejectConfirmed(this.observations);

 //this.notify(row)

 console.log('rechazado', this.user, row)
}

notify(row: any) {
  const dataToNotificate = {
        nameWell: this.well,
        observation: this.observations,
        user: this.user,
        equipment: row, 
        idStandardStates: 4,
  }
  
  this.notificationService.postNotification(dataToNotificate).subscribe({
    next: (response) => {
      console.log('Notification sent successfully:', response);
    },
    error: (error) => {
      console.error('Error sending notification:', error);
    },
    complete: () => {
      console.log('Notification request completed.');
    }
  });
}
}
