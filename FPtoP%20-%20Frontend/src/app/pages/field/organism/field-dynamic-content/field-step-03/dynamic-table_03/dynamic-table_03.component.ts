import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { GenericRequestPageComponent } from 'src/app/pages/field/generic-request-page/generic-request-page.component'; 
import { event } from 'cypress/types/jquery';
import { PdfViewerDialogComponent } from 'src/app/organisms/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { debounceTime, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { getUuid } from 'pdfjs-dist/types/src/shared/util';
import { v4 as uuidv4 } from 'uuid';



export type ColumnElement = {
  type: 'text' | 'button';
  value?: string;
  label?: string;
  position?: 'left' | 'right';
  boolValue?: 'true' | 'false';
  state?:  '1' | '2' | '3' | '4' ;
  functionName?: string;
  params?: any[];
  width?: string;

};
@Component({
  selector: "app-dynamic-table_03",
  templateUrl: "./dynamic-table_03.component.html",
  styleUrls: ["./dynamic-table_03.component.scss"],
})
export class DynamicTableComponent03 implements OnChanges {
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
    group: string;
    }[] = [];


  @Input() columnConfig: any;
  @Input() searchTerm: string = "";
  @Input() genericRequestPage: GenericRequestPageComponent; // Accept the component instance
  @Input() table:string;
  @Input() index:number;
  
  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  @Output() parentAction = new EventEmitter<string>;

  @Output() rowUpdated = new EventEmitter<{ item: any; groupKey: string }>();
  @Output() updatedFieldsChange = new EventEmitter<
  { tableName: string;
    fieldName: string; 
    idRow: string; 
    newValue: any;
    idOilfieldOperations: string;
    tally_id: string;
    idElementRelease: string; 
    groupid: string
  }[]>();

  dataToDisplay: { [groupKey: string]: any[] } = {};
  shouldDisplayButtons: Set<any> = new Set();
  maxRowIndex: number = 0;
  isGrouped: boolean = false;
  printedGroups: Set<string> = new Set();
  displayKeys: string[] = [];
  collapsedGroups: Set<string> = new Set();
  @ViewChild("tableTitle", { static: false }) tableTitle: ElementRef;
  keyLabel: string = "Root";
  inputBindings: { [rowId: string]: number } = {};

  private inputSubject = new Subject<{ group: string; row: any; columnKey: string; newValue: any }>();

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) {}
  

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges triggered:', changes);
    if (changes.groupedData || changes.searchTerm) {
      this.printedGroups.clear();
      this.prepareDataForDisplay();
    } 
  }

  ngOnInit(): void {
    
    this.inputSubject.pipe(debounceTime(1000)).subscribe(({ group, row, columnKey, newValue }) => {
          this.onValueChangeDelayed(group, row, columnKey, newValue);
        });

    if (!this.columnConfig) {
      this.columnConfig = { styles: {} }; 
    }
    this.printedGroups.clear();
    this.setInputDefautlValues()
    this.assignRowIndexes();
    console.log('ngoninit')
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

    return Object.keys(obj).sort();
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
      //this.dataToDisplay = this.groupDuplicatesData(this.dataToDisplay, "idElementRelease") 
};
      this.dataToDisplay = this.sortDataByColumn(
        this.dataToDisplay,
        sortColumn,
        true
      );
      this.isGrouped = false;
      //this.updateSequenceNumbers('Default')
      this.assignRowIndexes();
    }


  
    groupDuplicatesData(data: { [key: string]: any[] }, groupBy: string): { [key: string]: any[] } {
      const groupedData: { [key: string]: any[] } = {};
  
      Object.keys(data).forEach(groupKey => {
          data[groupKey].forEach(item => {
              const type = item[groupBy];
  
              if (!groupedData[type]) {
                  // Store existing rows under the same type key
                  groupedData[type] = [item];
              } else {
                  // Append item to existing group (without modifying)
                  groupedData[type].push(item);
              }
          });
      });
  
      return groupedData;
  }
  
 


  setInputDefautlValues(){
    if (Object.keys(this.inputBindings).length === 0) {
      this.displayKeys = this.getKeys(this.dataToDisplay);
      Object.keys(this.dataToDisplay).forEach(groupKey => {
        this.dataToDisplay[groupKey].forEach(row => {
          
          
          //if (row['ElementRelease.quantity']>0)
          this.inputBindings[row.groupid.toString()] = 1//Number(row['ElementRelease.quantity']) || 0; // Initialize the input with the row's current numeric value
      
      });
    })
  }  
  }

  applyFilter(data: { [key: string]: any[] }): { [key: string]: any[] } {
  const filteredResult: { [key: string]: any[] } = {};
  const matchedIds = new Set<string | number>();

  // Paso 1: identificar ids de elementos que coinciden con el filtro
  Object.keys(data).forEach((groupKey) => {
    data[groupKey].forEach((row: any) => {
      const matches = Object.keys(this.columnConfig.columns).some((key) => {
        const column = this.columnConfig.columns[key];
        if (column.filterable) {
          return row[key]
            ?.toString()
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase());
        }
        return false;
      });

      if (matches && row.groupstallyrighttable != null) {
        matchedIds.add(row.groupstallyrighttable);
      }
    });
  });

  // Paso 2: recolectar todos los elementos que tengan esos ids
  Object.keys(data).forEach((groupKey) => {
    filteredResult[groupKey] = data[groupKey].filter((row: any) =>
      matchedIds.has(row.groupstallyrighttable)
    );
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



  getEnableDragAndDrop(group: string): boolean {
    return this.columnConfig.styles?.enableDragAndDrop ?? false;
  }

  getMaxSequenceNumber(): number {
    let maxSequence: number | null = null;
  
    Object.values(this.groupedData).forEach((group: any[]) => {
      group.forEach(row => {
        const parentIsNull = row.tallyGroupParent == null;
        const quantity = Number(row['ElementTally.quantity']);
        const sequence = Number(row['ElementTally.sequence_number']);
  
        if (parentIsNull && quantity > 0 && !isNaN(sequence)) {
          if (maxSequence === null || sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      });
    });
  
    return maxSequence || 0;
  }
  transferRow(item: any, increase: string, decrease: string, amount: number, grouptallyrighttableid: any) {
   try{
    //var amount = Number(this.inputBindings[item[nue]])

        item[decrease] -=  amount
        let newItem = structuredClone(item); 
        
        newItem['idElementTally']=  uuidv4()
        //only newrowid = 1 is displayed on the screen, this is because we can have many rows representing the same information because of grouping needed for the data
        newItem["newrowid"] = '1'
        //for the table on the left we need to set the grouprownumber to different than 1, so that the new rows to be created are not displayed on the left table
        newItem["grouprownumber"] = '1'
        newItem["grouprownumberlefttablefilter"] = '2'
        newItem["groupstallyrighttable"] = grouptallyrighttableid// uuidv4()
        newItem["group"] = newItem["groupstallyrighttable"]
        newItem["origin"] = 'new'
        console.log(' this.getMaxSequenceNumber()', this.getMaxSequenceNumber())
        newItem["ElementTally.sequence_number"] = this.getMaxSequenceNumber()+1
        
        
        newItem[increase] = amount//Number(this.inputBindings[item[nue]]);
        this.groupedData[newItem['type']].push({ ...newItem });
        
        console.log('dec ElementRelease.availablequantity', newItem, decrease, increase)
        // this.updatValueForGroup(newItem,this.groupedData[newItem['type']],decrease)
        
        this.onInputChange(newItem, decrease)
        this.onInputChange(newItem, increase)
        //this.onInputChange(newItem, 'ElementTally.group')
        
        this.rowUpdated.emit(newItem)
      }
     catch (error) {
      console.log("transferRow error",error)
    }
  }



  getgroupstallyrighttable(item: any): any {
    if (!item || !item.groupstallyrighttable) return false;
  
    let count = 0;
  
    Object.values(this.groupedData).forEach((group: any[]) => {
      group.forEach(row => {
        if (row.groupstallyrighttable === item.groupstallyrighttable) {
          count++;
        }
      });
    });
    if (count > 1){
      return item.groupstallyrighttable
    }
    else {
      return uuidv4()
    }
  }
  
  

 

updateMaxRowIndex(currentIndex: number): void {
  if (currentIndex > this.maxRowIndex) {
    this.maxRowIndex = currentIndex;
  }
}
  

  updateQuantityForGroup(targetItem: any, dataset: any[]) {
    
    // Extract key values from targetItem
      const { type, groupid, 'ElementRelease.availablequantity': newQuantity } = targetItem;

      // Find and update all matching rows where grouprownumber === 1
      dataset.forEach(item => {
        
          if (item.type === type && 
              item.groupid === groupid 
              ) {
                console.log('updateQuantityForGroup',item.type, item.groupid, item.grouprownumber)
                console.log('updateQuantityForGroup2',type, groupid, 1)    
              item['ElementRelease.availablequantity'] = newQuantity; 
              console.log('sent to onInputChange', item)
              this.onInputChange(item, 'ElementRelease.availablequantity')
          }
      });
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

  getrowQuantity(row: any){
    let total = 0
    this.groupedData[row['type']].forEach(item => {
    
      if (item.type === row.type && 
          item.groupid === row.groupid 
          ) {
           
          total += item['ElementTally.quantity'] 
}
  })
    return total
}

  getrowGroupId(){
    return this.columnConfig?.styles?.rowGroupId ?? 'grouprownumber';

  }

  

  onInputChange(item: any, columnKey: string) {
    // Extract table name and field
    
    const tableName = columnKey.split('.')[0]; // Extract table name from the field
    const field = columnKey.split('.')[1]; // Extract field name
    let idRow = item[`id${tableName}`]; // Get the ID dynamically
    let existingIndex = -1/*this.updatedFields.findIndex(
      (entry) => entry.groupid === item['groupid'] 
      && entry.fieldName === field && entry.tableName === tableName
    );*/
    if(idRow){
      console.log('this.updatedFields idrow')
       existingIndex = this.updatedFields.findIndex(
        (entry) => String(entry.idRow) == String(idRow) 
        && entry.fieldName === field && entry.tableName === tableName
      );
    }
    // Check if the entry already exists in updatedFields 
    console.log('this.updatedFields',idRow, existingIndex, tableName,field,idRow,    this.updatedFields)
    if (existingIndex > -1) {
      // Update the existing entry
      this.updatedFields[existingIndex].newValue = item[columnKey];
      console.log("this.updatedFields exists",idRow)
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
            group: item['group']
            //sequence_number: this.index//item['ElementTally.sequence_number'],
          });
          console.log('onInputChange',this.updatedFields, item)
        } 
        
        this.updatedFieldsChange.emit([...this.updatedFields]);
        
      //}
  }
  
  
  
  onInputChangetransferRow(item1: any, item2: any, item3: any, item4: any) {

    console.log("onInputChangetransferRow", {item1, item2, item3, item4});
  }

  stateSetter(item: any, column: string, state: string) {
      item[column] = state; 
      this.prepareDataForDisplay(); // Refresh the table data
//      this.rowUpdated.emit(item); // Emit the updated item      
      this.onInputChange(item, column)
  }

  trueFalseSetter(item: any, column: string, boolValue: string | undefined) {
    let newItem = structuredClone(item); 
    if (typeof boolValue !== "undefined") {
      newItem[column] = true//boolValue 
      //this.rowUpdated.emit(item); // Emit the updated item
      this.updatValueForGroup(newItem,this.groupedData[newItem['type']],column)
      this.prepareDataForDisplay(); // Refresh the table data
      
      //this.onInputChange(item, column)

    } else {
      newItem[column] = null//boolValue 
      //this.rowUpdated.emit(item); // Emit the updated item
      this.updatValueForGroup(newItem,this.groupedData[newItem['type']],column)
      this.prepareDataForDisplay(); // Refresh the table data
    }
    
  }

  mifuncionConServicoQueMePasaronPDF(parametro: any) {

    const dialogRef = this.dialog.open(PdfViewerDialogComponent, {
      width: "80%",
      height: "80%",
      data: { url: parametro["filepath"], title: parametro["documentos"] },
    });
    dialogRef.afterClosed().subscribe((result) => {});

    
  }

  executeFunction(item: any, columnKey: string, element: ColumnElement, transferValue?: any ): void {
    const { functionName, params, boolValue, state } = element;
    const safeParams = params || [];

    console.log('to execute ', { functionName, params, boolValue });
    if (functionName) {
      if (functionName.includes(".")) {
        const [componentRef, methodName] = functionName.split(".");
        const componentInstance = (this as any)[componentRef];
        if (
          componentInstance &&
          typeof componentInstance[methodName] === "function"
        ) {
          try {
            if (state !== undefined) {
              
              componentInstance[methodName](...safeParams, state);
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
            if (state !== undefined) {
              
              method.call(this, item, ...safeParams, state);
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
    // Flatten all the data inside groupedData
    const flattenedData = Object.values(this.groupedData).flat();
  
    // Filter by groupId and return the entire objects
    const filteredItems = flattenedData.filter((item: any) => item.groupid === groupId);
    
    //console.log("Filtered Items:", filteredItems);
    return filteredItems;
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
   this.rowUpdated.emit({ item: row, groupKey: group });
    
  }


onValidateMax(value: number, row: any): void {
  const max = row['ElementRelease.availablequantity'];
  const min = 0;

  // Esperar al siguiente ciclo de ejecución para no interferir con la entrada del usuario
  setTimeout(() => {
    if (value > max) {
      this.inputBindings[row.groupid] = max;
    } else if (value < min || value === null) {
      this.inputBindings[row.groupid] = min;
    }
  });
}
 printdataToDisplay(){
  const type = 'Cabezales'
  const typeKey = this.groupedData[type] ? type : 'Default';
  const groupRows = [...this.groupedData[typeKey]]
    .filter((r: any) => r.groups === 100009413)
    .sort((a, b) => Number(a.grouprownumber) - Number(b.grouprownumber));
  console.log('aa', this.dataToDisplay,this.groupedData, groupRows)
 }
  

 
shouldShowGroupButtons(row: any, groupId: string): boolean {
  
  const groupRows = [...this.groupedData[row.type]]
    .filter((r: any) => r.groups === groupId)
    .sort((a, b) => Number(a.grouprownumber) - Number(b.grouprownumber));
    //console.log('row.type',groupRows)
  return groupRows[0] === row;
}

countRowsInGroup(row: any, group: string): number {
  const groupId = row.groupstallyrighttable;
  const firstIndexOfGroup = this.groupedData[row.type]
  .filter((r: any) => r.groupstallyrighttable === groupId && r.tallyGroupParent == null && r.origin===row?.orign  );
  return firstIndexOfGroup.length;
}

trueFalseSetterGroup(row: any, val: boolean | null) {
  const groupId = row.groups;
  const rowsToUpdate = this.dataToDisplay[row.type]
  .filter((r: any) => r.groups === groupId);  
  
  rowsToUpdate.forEach(r => {
    r['ElementRelease.approvalStatus'] = val;
    this.onInputChange(r, 'ElementRelease.approvalStatus')
  });

  
  console.log('rowsToUpdate',rowsToUpdate)
  //this.updatValueForGroup(newItem,this.groupedData[newItem['type']],column)
  this.prepareDataForDisplay(); // Refresh the table data
  //this.parentAction.emit("save"); 
    //this.onInputChange(item, column)
 
}

transferRowgroup(row: any, increase: string, decrease: string, groupid: string){
  const groupId = row.groups;
  
  const groupstallyrighttable = uuidv4()//this.getgroupstallyrighttable(row)
  var amount = Number(this.inputBindings[row[groupid]])
  const rowsToUpdate = this.dataToDisplay[row.type]
  .filter((r: any) => r.groups === groupId);  
  rowsToUpdate.forEach(r => {
    console.log('transferRowgroup',r, r.groups, r.tallyGroupParent, r.groupsdisplaybutton)
    this.transferRow(r,increase, decrease, amount, groupstallyrighttable)
  });

  const availablequantity =  row['ElementRelease.availablequantity']
  const rowsToUpdateall = this.groupedData[row.type]
  .filter((r: any) => r.groups === groupId);  
  rowsToUpdateall.forEach(r => {
    r['ElementRelease.availablequantity'] = availablequantity
  });
  console.log('rowsToUpdate',rowsToUpdate)
}

returnQuantityToRelease(row: any, increase: string, decrease: string, nue: string){
  const groupId = row.groups;
  const rowsToUpdate = this.groupedData[row.type]
  .filter((r: any) => r.groups === groupId);  
  rowsToUpdate.forEach(r => {
      r['ElementRelease.availablequantity']+= r['ElementTally.quantity']
      r['ElementTally.quantity'] = 0 
      this.onInputChange(r, 'ElementTally.quantity')
      this.onInputChange(r, 'ElementRelease.availablequantity')     
      
      
      });
        
      
      setTimeout(() => this.rowUpdated.emit(row), 0);  
}
markRowsWithButtons() {
  this.shouldDisplayButtons.clear();

  for (const typeKey of Object.keys(this.dataToDisplay)) {
    const rows = this.dataToDisplay[typeKey];
    const grouped = rows.reduce((acc, row) => {
      const groupId = row.groups;
      if (!acc[groupId]) acc[groupId] = [];
      acc[groupId].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    for (const groupId in grouped) {
      const groupRows = grouped[groupId];
      groupRows.sort((a: any, b: any) => Number(a.grouprownumber) - Number(b.grouprownumber));
      if (groupRows.length > 0) {
        this.shouldDisplayButtons.add(groupRows[0]);
      }
    }
  }
}
asignIndex(row: any, index: any){
  //row['ElementTally.sequence_number']= index
  return true 
}
private assignRowIndexes(): void {
  Object.keys(this.dataToDisplay).forEach(groupKey => {
    const rows = this.getDataFromLabel(groupKey, this.dataToDisplay);
    if (Array.isArray(rows)) {
      rows.forEach((row, index) => {
        row.index = index;
      });
    }
  });
}


}



function isFunction(component: DynamicTableComponent03, methodName: any): methodName is keyof DynamicTableComponent03 {
  return typeof component[methodName as keyof DynamicTableComponent03] === 'function';
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


