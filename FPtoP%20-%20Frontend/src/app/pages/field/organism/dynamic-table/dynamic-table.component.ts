import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild ,ElementRef, Renderer2} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { GenericRequestPageComponent } from '../../generic-request-page/generic-request-page.component';
import { event } from 'cypress/types/jquery';
import { PdfViewerDialogComponent } from 'src/app/organisms/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { debounceTime, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { GetDocumentsOfElementService } from 'src/app/services/get-documents-of-element.service';


export type ColumnElement = {
  type: 'text' | 'button';
  value?: string;
  label?: string;
  position?: 'left' | 'right';
  boolValue?: 'true' | 'false';
  functionName?: string;
  params?: any[];
  width?: string;

};

@Component({
  selector: "app-dynamic-table",
  templateUrl: "./dynamic-table.component.html",
  styleUrls: ["./dynamic-table.component.scss"],
})
export class DynamicTableComponent implements OnChanges {
  @Input() searchingItems: any[];
  @Input() groupedData: { [key: string]: any[] } = {};
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


  @Input() columnConfig: any;
  @Input() searchTerm: string = "";
  @Input() genericRequestPage: GenericRequestPageComponent; // Accept the component instance

  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  @Output() rowUpdated = new EventEmitter<{ item: any; groupKey: string }>();
  @Output() updatedFieldsChange = new EventEmitter<
  { tableName: string;
    fieldName: string; 
    idRow: string; 
    newValue: any;
    idOilfieldOperations: string;
    tally_id: string;
    idElementRelease: string; 
    groupid: string;
    sequence_number: any;}[]
>();
  @Output() parentAction = new EventEmitter<string>;

  dataToDisplay: { [groupKey: string]: any[] } = {};
  
  isGrouped: boolean = false;
  printedGroups: Set<string> = new Set();
  displayKeys: string[] = [];
  collapsedGroups: Set<string> = new Set();
  @ViewChild("tableTitle", { static: false }) tableTitle: ElementRef;
  keyLabel: string = "Root";
  inputBindings: { [rowId: string]: string } = {};
  workingRow: any;

  private inputSubject = new Subject<{ group: string; row: any; columnKey: string; newValue: any }>();

  constructor(
    public dialog: MatDialog,
    private getDocumentsService: GetDocumentsOfElementService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.groupedData || changes.searchTerm) {
      this.printedGroups.clear();
      this.prepareDataForDisplay();
    }
    this.displayKeys = this.getKeys(this.dataToDisplay);
  }

  ngOnInit(): void {
    
    this.inputSubject.pipe(debounceTime(1000)).subscribe(({ group, row, columnKey, newValue }) => {
          this.onValueChangeDelayed(group, row, columnKey, newValue);
        });

    if (!this.columnConfig) {
      this.columnConfig = { styles: {} }; // Initialize columnConfig with an empty styles object
    }
    this.printedGroups.clear();
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  isObject(value: any): boolean {
    return value !== null && typeof value === "object";
  }
  isGroup(key: string, value: any): boolean {
    // Check if the value is an array of objects
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "object" &&
      !this.isDataRow(value[0])
    );
  }

  isDataRow(value: any): boolean {
    // Check if the value has properties related to rows (like type, SubType, etc.)
    return value.hasOwnProperty("type");
  }

  getColumnKeys(group: string): string[] {
    return this.dataToDisplay[group]?.length > 0
      ? Object.keys(this.dataToDisplay[group][0]).filter(
          (key) => key !== "type"
        )
      : [];
  }

  getColumnType(columnKey: string): string {
    return this.columnConfig.columns[columnKey]?.type || "text";
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig.columns[columnKey]?.label || columnKey;
  }

  getColumnDisplayName(columnKey: string): string {
    return this.columnConfig.columns[columnKey]?.name || columnKey;
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getColumnToDisplay(group: string): string[] {
    // Split the group by '/' to handle hierarchical levels
    const groupLevels = group.split("/");

    // Initialize currentDataLevel as the root of dataToDisplay
    let currentDataLevel: any = this.dataToDisplay;

    // Traverse the hierarchical data structure in dataToDisplay
    for (const level of groupLevels) {
      if (!currentDataLevel || typeof currentDataLevel !== "object") {
        return []; // Return an empty array if any level in the hierarchy is missing
      }

      // Check if the current level is an object (dictionary) or an array
      if (Array.isArray(currentDataLevel)) {
        return []; // If currentDataLevel is an array, return empty because it's not an object to traverse
      }

      // Check if the level exists in the current object
      if (!(level in currentDataLevel)) {
        return []; // Return empty array if the group level doesn't exist
      }

      // Move to the next level in the hierarchy
      currentDataLevel = currentDataLevel[level];
    }

    // Ensure that currentDataLevel is now an array at the final level
    if (!Array.isArray(currentDataLevel) || currentDataLevel.length === 0) {
      return []; // Return an empty array if there's no data at the final level
    }

    // Get the column configuration keys
    const configKeys = Object.keys(this.columnConfig.columns)
  .filter(key => this.columnConfig.columns[key].type !== '');

    // Return the filtered keys that exist in the data at the current level
    return configKeys.filter((col) => col in currentDataLevel[0]);
  }

  getFilteredColumnKeys(group: string): string[] {
    const groupLevels = group.split("/");
    let currentDataLevel: any = this.dataToDisplay;

    // Traverse through the hierarchy to get the columns at the final level
    for (const level of groupLevels) {
      if (
        !currentDataLevel ||
        typeof currentDataLevel !== "object" ||
        !(level in currentDataLevel)
      ) {
        console.error("Invalid group level or structure:", {
          level,
          currentDataLevel,
        });
        return [];
      }
      currentDataLevel = currentDataLevel[level];
    }

    // Log the current data level to debug
    // Return column keys if we have data at the final level
    return Array.isArray(currentDataLevel) && currentDataLevel.length > 0
      ? Object.keys(currentDataLevel[0]).filter((key) => key !== "type")
      : [];
  }

  isArrayOfRows(data: any): boolean {
    return (
      Array.isArray(data) ||
      (this.isObject(data) &&
        Object.keys(data).every((key) => !isNaN(Number(key))))
    );
  }

  getColumnClass(columnKey: string): string {
    const type = this.getColumnType(columnKey);
    if (type === "input") {
      return "number-column";
    } else if (type === "text" && columnKey === "descripcion") {
      return "long-text-column";
    } else {
      return "text-column";
    }
  }

  getHeaderStyle(): { [key: string]: string } {
    const backgroundColor =
      this.columnConfig.styles?.headerBackgroundColor || "transparent";
    const fontColor = backgroundColor !== "transparent" ? "white" : "inherit";
    return {
      "background-color": backgroundColor,
      color: fontColor,
      "text-align": "center",
    };
  }

  shouldShowTableTitle(): boolean {
    return this.columnConfig.styles?.showTableTitle !== false;
  }

  shouldPrintGroupTitle(group: string): boolean {
    const groupKey = group.split("/")[0];

    if (
      this.tableTitle &&
      this.tableTitle.nativeElement.innerText.includes(groupKey)
    ) {
      return false; // Title already exists
    }
    return true;
  }
  getTitleStyle(): { [key: string]: string } {
    return { color: this.columnConfig.styles?.titleColor || "inherit" };
  }

  getColumnStyle(columnKey: string): { [key: string]: string } {
    return {
      color:
        this.columnConfig.styles?.columnStyles?.[columnKey]?.color || "inherit",
    };
  }

  getColumnRender(columnKey: string): ColumnElement[] {
    return this.columnConfig.columns[columnKey]?.render;
  }

  preFilterData(data: { [key: string]: any[] }): { [key: string]: any[] } {
    const filteredData: { [key: string]: any[] } = {};
    Object.keys(data).forEach((groupKey) => {
      filteredData[groupKey] = data[groupKey].filter((row: any) => {
        return Object.keys(this.columnConfig.columns).every((key) => {
          const column = this.columnConfig.columns[key];
          if (column.filterCondition) {
            return column.filterCondition(row[key]);
          }
          return true;
        });
      });
    });
    return filteredData;
  }

  prepareDataForDisplay() {
    const groupByColumn = this.columnConfig?.styles?.groupByColumn;
    const sortColumn = this.columnConfig?.styles?.sortColumn;
    let dataToProcess = this.preFilterData(this.groupedData);

    // Apply filter by search term
    if (this.searchTerm) {
      dataToProcess = this.applyFilter(dataToProcess);
    }

    if (groupByColumn) {
      dataToProcess = this.sortDataByColumn(dataToProcess, sortColumn, true);
      this.dataToDisplay = this.groupDataByColumn(dataToProcess, groupByColumn);

      this.isGrouped = true;
    } else {
      this.dataToDisplay = { Default: this.flattenData(dataToProcess) };
      this.dataToDisplay = this.sortDataByColumn(
        this.dataToDisplay,
        sortColumn,
        true
      );
      this.isGrouped = false;
    }
  }

  applyFilter(data: { [key: string]: any[] }): { [key: string]: any[] } {
    const filteredResult: { [key: string]: any[] } = {};
    Object.keys(data).forEach((groupKey) => {
      filteredResult[groupKey] = data[groupKey].filter((row: any) => {
        return Object.keys(this.columnConfig.columns).some((key) => {
          const column = this.columnConfig.columns[key];
          if (column.filterable) {
            return row[key]
              ?.toString()
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    });
    return filteredResult;
  }

  flattenData(data: { [key: string]: any[] }): any[] {
    return Object.values(data).reduce((acc, val) => acc.concat(val), []);
  }

  groupDataByColumn(
    data: { [key: string]: any[] },
    composedColumn: string
  ): { [groupKey: string]: any[] } {
    const groupedData: { [groupKey: string]: any[] } = {};
    const columns = composedColumn.split("/"); // Split the composed string into separate columns

    return groupDataByColumnRec(data, composedColumn);
  }

  sortDataByColumn(
  data: { [key: string]: any[] },
  sortColumn: string,
  ascending: boolean = true
) {
  for (const groupKey in data) {
    data[groupKey].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      const isNumber = !isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB));

      if (isNumber) {
        return ascending
          ? parseFloat(valA) - parseFloat(valB)
          : parseFloat(valB) - parseFloat(valA);
      }

      // Fallback to string comparison (case-insensitive)
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return ascending ? -1 : 1;
      if (strA > strB) return ascending ? 1 : -1;
      return 0;
    });

    data[groupKey].forEach((item, index) => {
      item.sortOrder = index + 1;
    });
  }

  return data;
}


  onDrop(event: CdkDragDrop<any[]>, group: string) {
    moveItemInArray(
      this.dataToDisplay[group],
      event.previousIndex,
      event.currentIndex
    );
    this.dataToDisplay[group].forEach((item, index) => {
      item["ElementTally.sequence_number"] = index;
      //item["state"] = 'updated'
      this.onInputChange(item, "ElementTally.sequence_number")
    });
  }

  getEnableDragAndDrop(group: string): boolean {
    return this.columnConfig.styles?.enableDragAndDrop ?? false;
  }

  transferRow(item: any, increase: string, decrease: string, nue: string) {
    //hacer que se controle la cantidad q se incrementa
    console.log('item to transfer', item)
    if (item[decrease] > 0) {
      item[decrease] -= 1;
      item[increase] += 1;
    } else {
      console.log("No more items available to transfer");
    }
    console.log('se act',item, increase, decrease)
    this.rowUpdated.emit(item);
    this.prepareDataForDisplay();
    this.onInputChange(item, decrease)
    this.onInputChange(item, increase)
  }


  onInputChange(item: any, columnKey: string) {
    // Extract table name and field
    
    const tableName = columnKey.split('.')[0]; // Extract table name from the field
    const field = columnKey.split('.')[1]; // Extract field name
    const idRow = item[`id${tableName}`]; // Get the ID dynamically
    const existingIndex = -1/*this.updatedFields.findIndex(
      (entry) => entry.groupid === item['groupid'] 
      && entry.fieldName === field && entry.tableName === tableName
    );*/
    if(!idRow){
      const existingIndex = this.updatedFields.findIndex(
        (entry) => entry.idRow === idRow 
        && entry.fieldName === field && entry.tableName === tableName
      );
    }
    // Check if the entry already exists in updatedFields
    
    if (existingIndex > -1) {
      // Update the existing entry
      this.updatedFields[existingIndex].newValue = item[columnKey];
    } else {
      // Add a new entry
    //if (idRow){

          this.updatedFields.push({
            tableName,
            fieldName: field,
            idRow: idRow,
            newValue: item[columnKey],
            idOilfieldOperations: item["idOilfieldOperations"],
            tally_id: item['tally_id'],
            idElementRelease: item['idElementRelease'], 
            groupid: item['groupid'],
            sequence_number: item['sortOrder'],
          });
          console.log("this.updatedFields",idRow)
        }
        this.updatedFieldsChange.emit([...this.updatedFields]);
        
      //}
  }
  
  
  
  onInputChangetransferRow(item1: any, item2: any, item3: any, item4: any) {

    console.log("onInputChangetransferRow", {item1, item2, item3, item4});
  }

  trueFalseSetter(item: any, column: string, boolValue: string | undefined) {
    let newItem = structuredClone(item); 
    if (typeof boolValue !== "undefined") {
      newItem[column] = true//boolValue 
      console.log('trueFalseSetter',newItem['ElementRelease.approvalStatus'],newItem, column,boolValue)
      //this.rowUpdated.emit(item); // Emit the updated item
      this.updatValueForGroup(newItem,this.groupedData[newItem['type']],column)
      this.prepareDataForDisplay(); // Refresh the table data
      this.parentAction.emit("save"); 
      //this.onInputChange(item, column)

    } else {
      console.error("Error: boolValue is undefined for column", column);
    }
  }

  updatValueForGroup(targetItem: any, dataset: any[], column: any) {
    
    // Extract key values from targetItem
    const { type, groupid } = targetItem; 
    const newValue = targetItem[column]; 


      // Find and update all matching rows where grouprownumber === 1
      dataset.forEach(item => {
        
          if (item.type === type && 
              item.groupid === groupid 
              ) {
                  
              item[column] = newValue; 
              console.log('sent to onInputChange', item,newValue, column, item[column])
              this.onInputChange(item, column)
          }
      });
      console.log('this.groupedData',this.groupedData, dataset)
  }
  showFile(parametro: any) {
  this.getDocumentsService.getFileFromPath(parametro.filepath, parametro.fileid, parametro.filename)
    .subscribe(blob => {
      const blobUrl = URL.createObjectURL(blob);
    console.log('blob.type', blob.type)
      //if (blob.type === 'pdf') {
        if (parametro.filename.toLowerCase().endsWith('pdf')) {
        const dialogRef = this.dialog.open(PdfViewerDialogComponent, {
          width: '80%',
          height: '80%',
          data: {
            url: blobUrl,
            title: parametro.filename
          }
        });

        dialogRef.afterClosed().subscribe(() => {
          URL.revokeObjectURL(blobUrl); 
        });

      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = parametro.filename || 'archivo';
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(blobUrl); 
      }
    });
}

  executeFunction(item: any, columnKey: string, element: ColumnElement, transferValue?: any ): void {
    const { functionName, params, boolValue } = element;
    const safeParams = params || [];
    console.log('transferValue inside executeFunction',this.inputBindings[transferValue]);
    console.log('transferValue inside executeFunction',transferValue);

    console.log('to execute ', { functionName, params, boolValue });
    
    this.workingRow = item;
    console.log('this.workingRow', this.workingRow)
    if (functionName) {
      if (functionName.includes(".")) {
        const [componentRef, methodName] = functionName.split(".");
        const componentInstance = (this as any)[componentRef];
        if (
          componentInstance &&
          typeof componentInstance[methodName] === "function"
        ) {
          try {
            if (boolValue !== undefined) {
              componentInstance[methodName](...safeParams, boolValue);
            } else {
              componentInstance[methodName](...safeParams);
            }
          } catch (error) {
            //console.error(Error executing function ${functionName}:, error);
          }
        } else {
          //console.warn(Function ${functionName} is not defined or accessible in ${componentRef}.);
        }
      } else {
        const method = (this as any)[functionName];
        if (typeof method === "function") {
          try {
            if (boolValue !== undefined) {
              method.call(this, item, ...safeParams, boolValue);
            } else {
              method.call(this, item, ...safeParams);
            }
          } catch (error) {
            //console.error(Error executing function ${functionName}:, error);
          }
        } else {
          //console.warn(Function ${functionName} is not defined in DynamicTableComponent.);
        }
      }
    } else {
      console.warn("No functionName provided in element config.");
    }
  }

  isRadioChecked(itemValue: any, radioValue: string): boolean {
    return radioValue === "true"
      ? itemValue === true
      : radioValue === "false" && itemValue === false;
  }

  onRadioChange(item: any, columnKey: string, radioValue: string) {
    item[columnKey] = radioValue === "true";
  }

  isChecked(value: any, label: string): boolean {
    return value === "Si" || value === "no";
  }
  toggleCollapse(group: string) {
    if (this.collapsedGroups.has(group)) {
      this.collapsedGroups.delete(group);
      console.log("deleted", this.collapsedGroups);
    } else {
      this.collapsedGroups.add(group);
      console.log("expand", this.collapsedGroups);
    }
  }
  isCollapsed(group: string): boolean {
    return this.collapsedGroups.has(group);
  }
  eraseGroup(group: string) {
    const mainGroupKey = group.split("/")[0];
    const subGroupKey = group.split("/")[1];

    // Check if the main group key exists in groupedData
    if (this.groupedData[mainGroupKey]) {
      // Filter out the entries in the main group by matching the subGroupKey

      this.groupedData[mainGroupKey] = this.groupedData[mainGroupKey].filter(
        (item) => item.SubType !== subGroupKey
      );
      this.printedGroups.clear();
      this.prepareDataForDisplay();
    }
  }

  getDataFromLabel(label: string, dataToDisplay: any): any {
    // Split the label by '/' to handle hierarchical levels
    const levels = label.split("/");

    // Start at the root of dataToDisplay
    let currentDataLevel = dataToDisplay;

    // Traverse through each level of the label
    for (const level of levels) {
      if (
        !currentDataLevel ||
        typeof currentDataLevel !== "object" ||
        !(level in currentDataLevel)
      ) {
        return null; // Return null if any part of the path is invalid
      }

      // Move to the next level in the hierarchy
      currentDataLevel = currentDataLevel[level];
    }

    // Return the final data after the full traversal
    return currentDataLevel;
  }
    getItemsByGroupId(groupId: string): any[] {
      const flattenedData = Object.values(this.groupedData).flat();

      const seenFilepaths = new Set<string>();
      const uniqueItems: any[] = [];

      for (const item of flattenedData) {
        if (item.groupid === groupId && !seenFilepaths.has(item.filepath)) {
          seenFilepaths.add(item.filepath);
          uniqueItems.push(item);
        }
      }

      return uniqueItems;
    }


  onValueChange(group: string, row: any, columnKey: string, newValue: any): void {
    console.log("onvaluechange", group, row,columnKey, newValue)
    this.inputSubject.next({ group, row, columnKey, newValue });
  }
  
  onValueChangeDelayed(group: string, row: any, columnKey: string, newValue: any): void {

    // Update the row's value for the given column
    console.log("row before",columnKey, row)
    
    row[columnKey] = newValue.value;
    row['state']='updated';
    console.log("row after",row)

    this.onInputChange(row, columnKey)
    
    // Emit an event to notify the parent component
    this.rowUpdated.emit({ item: row, groupKey: group });
    
  }

  onRejectConfirmed(comment: any):any{
    this.workingRow['ElementRelease.observations']=comment
    this.workingRow['ElementRelease.approvalStatus']='false'
    this.onInputChange(this.workingRow, 'ElementRelease.observations')
    this.onInputChange(this.workingRow, 'ElementRelease.approvalStatus')
    this.prepareDataForDisplay();
    this.parentAction.emit("notify");
    this.parentAction.emit("save");
    return this.workingRow
  }  
  
  getCumulativeValuesUpToRow(group: any, col: string, rowIndex: number): number[] {
  const labels = this.getColumnLabel(col)?.split('/') || [col];

  const cumulative = new Array(labels.length).fill(0);

  for (let i = 0; i <= rowIndex; i++) {
    const row = this.getDataFromLabel(group, this.dataToDisplay)[i];

    labels.forEach((label, idx) => {
      const val = Number(row?.[label]) || 0;
      cumulative[idx] += val;
    });
  }

  return cumulative;
}

}



function isFunction(component: DynamicTableComponent, methodName: any): methodName is keyof DynamicTableComponent {
  return typeof component[methodName as keyof DynamicTableComponent] === 'function';
}

function groupDataByColumnRec(
  data: { [key: string]: any[] },
  composedColumn: string
): { [groupKey: string]: any } {
  const columns = composedColumn.split('/'); // Split the composed string into separate columns
  const allItems: any[] = [];

  // Flatten the data into a single array
  for (const items of Object.values(data)) {
    allItems.push(...items);
  }

  return groupByColumns(allItems, columns);
}

function groupByColumns(
  data: any[],
  columns: string[]
): any {
  if (columns.length === 0) {
    return data;
  }

  const groupedData: { [groupKey: string]: any } = {};
  const column = columns[0];

  for (const item of data) {
    const groupKey = item[column] || '';

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = [];
    }

    groupedData[groupKey].push(item);
  }

  // Recursively group the data for the next columns
  if (columns.length > 1) {
    for (const groupKey in groupedData) {
      groupedData[groupKey] = groupByColumns(
        groupedData[groupKey],
        columns.slice(1)
      );
    }
  }

  return groupedData;
}


