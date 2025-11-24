  import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild ,ElementRef, Renderer2} from '@angular/core';
  import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
  import { GenericRequestPageComponent } from '../../../../generic-request-page/generic-request-page.component';
  import { debounceTime, Observable, Subject } from 'rxjs';
  import { StandardAttributesService } from 'src/app/pages/field/services/standardAttributes.service';
  import { v4 as uuidv4 } from 'uuid';


  export type ColumnElement = {
    type: 'text' | 'button';
    value?: string;
    label?: string;
    position?: 'left' | 'right';
    boolValue?: 'true' | 'false';
    functionName?: string;
    params?: any[];
  };

  @Component({
    selector: "app-dynamic-table_01",
    templateUrl: "./dynamic-table_01.component.html",
    styleUrls: ["./dynamic-table_01.component.scss"],
  })
  export class DynamicTableComponent01 implements OnChanges {
    @Input() searchingItems: any[];
    @Input() groupedData: { [key: string]: any[] };
    @Input() columnConfig: any;
    @Input() searchTerm: string = "";
    @Input() genericRequestPage: GenericRequestPageComponent;
    @Input() genericRequestPage_AddElement: any;
    @Input() genericRequestPage_AddEquipment: GenericRequestPageComponent;
    @Input() getAttributes: (tableName: string) => Observable<any[]>;
    @Input() standardAttributesService: any;
    @Input() equipmentOptions: any[] = [];

    @Output() searchChange = new EventEmitter<any>();
    @Output() search = new EventEmitter<any>();
    @Output() searchClear = new EventEmitter<any>();
    @Output() rowUpdated = new EventEmitter<{ item: any; groupKey: string }>();
    @Output() groupedDataChange = new EventEmitter<{ [key: string]: any[] }>();
    @Output() parentAction = new EventEmitter<string>;


    @ViewChild("tableTitle", { static: false }) tableTitle: ElementRef;

    dataToDisplay: { [groupKey: string]: any[] } = {};
    isGrouped: boolean = false;
    printedGroups: Set<string> = new Set();
    displayKeys: string[] = [];
    collapsedGroups: Set<string> = new Set();
    keyLabel: string = "Root";
    rowInputValues: { [group: string]: string } = {};
    arenaSubtypeMap: { [key: string]: string } = {};

    private inputSubject = new Subject<{ group: string; row: any; columnKey: string; newValue: any }>();

    computeArenaLabels() {
      const defaultData = this.groupedData?.Default ?? [];
    
      // Obtener subtipos únicos
      const uniqueArenaSubtypes = Array.from(
        new Set(
          defaultData
            .filter(item => item.group === 'ARENAS')
            .map(item => item.subtype)
        )
      );
    
      // Crear el mapa de subtipos
      this.arenaSubtypeMap = {};
      uniqueArenaSubtypes.forEach((subtype, index) => {
        this.arenaSubtypeMap[subtype] = `ARENA ${index + 1}`;
      });
    
      // Aplicar los valores de display a los elementos
      defaultData.forEach(item => {
        if (item.group === 'ARENAS') {
          item.sandDisplayName = this.arenaSubtypeMap[item.subtype] || item.subtype;
          //item.path = item.path.replace(item.path.split('//')[1], )
          //item.subtype = item.sandDisplayName;
        }
      });
    }
    
    
    ngOnChanges(changes: SimpleChanges): void {
      if (changes.groupedData || changes.searchTerm) {
        this.printedGroups.clear();
        this.prepareDataForDisplay();
      }
      this.displayKeys = this.getKeys(this.dataToDisplay);
    }

    ngOnInit(): void {
      this.inputSubject.pipe(debounceTime(1)).subscribe(({ group, row, columnKey, newValue }) => {
        this.onValueChangeDelayed(group, row, columnKey, newValue);
      });

      if (!this.columnConfig) {
        this.columnConfig = { styles: {} };
      }
      this.printedGroups.clear();
      //this.groupedData['Default'].forEach((row: any) =>{
      this.groupedData["Default"].forEach((row: any) => {
        /*try {
            this.rowInputValues[row.group + row.campo + row.perforations] = row['valorfinal'];
          } catch {
            console.warn('Missing value for row:', row);
          }*/
        this.rowInputValues[
          row.group +
            "<DELIM>" +
            row.type +
            "<DELIM>" +
            row.subtype +
            "<DELIM>" +
            row.perforation +
            row.perforations +
            row.campo
        ] = row["valorfinal"];
      });
      console.log("this.rowInputValues", this.rowInputValues);
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
    groups(obj: any): string[] {
      return ["GENERAL", "ARENAS", "EQUIPOS"];
    }
    getColumnToDisplay(group: string): string[] {
      const groupLevels = group.split("<DELIM>");
      let currentDataLevel: any = this.dataToDisplay;
      for (const level of groupLevels) {
        if (!currentDataLevel || typeof currentDataLevel !== "object") {
          //console.log("group", group);
          return [];
        }
        if (Array.isArray(currentDataLevel)) {
          //console.log("group 2", group);
          return [];
        }
        if (!(level in currentDataLevel)) {
          //console.log("group 3", level, currentDataLevel);
          return [];
        }
        currentDataLevel = currentDataLevel[level];
      }
      if (!Array.isArray(currentDataLevel) || currentDataLevel.length === 0) {
        return []; // Return an empty array if there's no data at the final level
      }
      const configKeys = Object.keys(this.columnConfig.columns)
    .filter(key => this.columnConfig.columns[key].type !== '');
      
      return configKeys.filter((col) => col in currentDataLevel[0]);
    }

    getFilteredColumnKeys(group: string): string[] {
      const groupLevels = group.split("<DELIM>");
      let currentDataLevel: any = this.dataToDisplay;
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

    getColumnWidth(columnKey: string): string {
      return this.columnConfig.columns[columnKey]?.width || "auto"; // Default to 'auto' if width is not set
    }

    getColumnAlign(columnKey: string): string {
      return this.columnConfig.columns[columnKey]?.align || "center";
    }

    shouldShowTableTitle(): boolean {
      return this.columnConfig.styles?.showTableTitle !== false;
    }

    shouldPrintGroupTitle(group: string): boolean {
      const groupKey = group.split("<DELIM>")[0];

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
          // First, filter out by campo
          if (row.campo === 'idElement' || row.campo === 'catalog_key_desc') {
            return false;
          }
    
          // Then apply filter conditions
          return Object.keys(this.columnConfig.columns).every((key) => {
            const column = this.columnConfig.columns[key];
            if (column.filterCondition) {
              return column.filterCondition(row[key]);
            }
            return true;
          });
        });
      });
    
      console.log('prefilterdata', filteredData);
      return filteredData;
    }
    
    prepareDataForDisplay() {
      const groupByColumn = this.columnConfig?.styles?.groupByColumn;
      const sortColumn = this.columnConfig?.styles?.sortColumn;
      let dataToProcess = this.preFilterData(this.groupedData);

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
      this.computeArenaLabels()
    }
    getArenaLabel(key: string): string {
      return this.arenaSubtypeMap[key] ?? key;
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
      const columns = composedColumn.split("<DELIM>");

      return groupDataByColumnRec(data, composedColumn);
    }

    sortDataByColumn(
      data: { [key: string]: any[] },
      sortColumn: string,
      ascending: boolean = true
    ) {
      for (const groupKey in data) {
        data[groupKey].sort((a, b) => {
          if (a[sortColumn] < b[sortColumn]) {
            return ascending ? -1 : 1;
          }
          if (a[sortColumn] > b[sortColumn]) {
            return ascending ? 1 : -1;
          }
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
    }

    getEnableDragAndDrop(group: string): boolean {
      return this.columnConfig.styles?.enableDragAndDrop ?? false;
    }

    transferRow(item: any, increase: string, decrease: string) {
      if (item[decrease] > 0) {
        item[decrease] -= 1;
        item[increase] += 1;
      } else {
        console.log("No more items available to transfer");
      }
      this.prepareDataForDisplay();
    }

    onValueChange(group: string, row: any, columnKey: string, newValue: any): void {
      
      this.inputSubject.next({ group, row, columnKey, newValue });
    }
    onValueChangeOption(group: string, row: any, columnKey: string, event: Event): void {
      const selectElement = event.target as HTMLSelectElement;
      //const selectedValue = selectElement.value;
      const newValue = selectElement.options[selectElement.selectedIndex].text;
      console.log("onValueChangeOption", newValue)
      //this.onValueChange( group, row, columnKey, newValue );
      row['state']= row['state']==="new" ? "new" : 'updated';
      row['valorfinal']= newValue;
    }

    onValueChangeDelayed(group: string, row: any, columnKey: string, newValue: any): void {

      // Update the row's value for the given column
      console.log("row before",row.group +
        "<DELIM>" +
        row.type +
        "<DELIM>" +
        row.subtype +
        "<DELIM>" +
        row.perforation +
        row.perforations +
        row.campo,
        this.rowInputValues[row.group +
        "<DELIM>" +
        row.type +
        "<DELIM>" +
        row.subtype +
        "<DELIM>" +
        row.perforation +
        row.perforations +
        row.campo])
      
      row[columnKey] = newValue.value;
      if(row.perforation=='DISPAROS'){
          this.rowInputValues[row.group +
            "<DELIM>" +
            row.type +
            "<DELIM>" +
            row.subtype +
            "<DELIM>" +
            row.perforation +
            row.perforations +
            row.campo] = newValue.value
            this.rowInputValues = { ...this.rowInputValues };
        }
      if( row['valorfinal'] != row['valorhistoricofp2p']){
        row['state']= row['state']==="new" ? "new" : 'updated';
      }else { 
        row['state']= 'saved';
      }
      console.log("row after",row)
      
    }



    trueFalseSetter(item: any, column: string, boolValue: string | undefined) {
      if (typeof boolValue !== "undefined") {
        item[column] = boolValue === "true";
        this.prepareDataForDisplay();
        this.rowUpdated.emit(item);
      } else {
        console.error("Error: boolValue is undefined for column", column);
      }
    }

    executeFunction(item: any, columnKey: string, element: ColumnElement): void {
      const { functionName, params, boolValue } = element;
      const safeParams = params || [];

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
    isFirstPerforation(group: string): boolean {
      console.log("datatodisplay", this.dataToDisplay);
      return true;
    }
    
    eraseAllGroups(): void {
      for (const mainGroupKey in this.groupedData) {
        if (!this.groupedData.hasOwnProperty(mainGroupKey)) continue;
    
        this.groupedData[mainGroupKey].forEach(item => {
          item.state = 'delete';
        });
      }
    
      this.printedGroups.clear();
      this.prepareDataForDisplay();
    }

    eraseGroup(group: string) {
      const parts = group.split("<DELIM>");
      const mainGroupKey = parts[1];
      const subGroupKey = parts[2]; // optional
      const thirdGroupKey = parts[3]; // optional
      console.log('parts',parts)
      if (!this.groupedData[mainGroupKey]) return;
    
      this.groupedData[mainGroupKey].forEach(item => {
        const matchesSubGroup = subGroupKey ? item.subtype === subGroupKey : true;
        const matchesThirdGroup = thirdGroupKey ? item.perforations === thirdGroupKey : true;
    
        if (matchesSubGroup && matchesThirdGroup) {
          item.state = 'delete';
        }
      });
      
      this.printedGroups.clear();
      this.prepareDataForDisplay();
    }
    

    erasePerforation(group: string) {
      const parts = group.split("<DELIM>");
      const mainGroupKey = parts[1];
      const subGroupKey = parts[2]; // optional
      const thirdGroupKey = parts[4]; // optional
      console.log('parts',parts)
      console.log(' this.groupedData[mainGroupKey]', this.groupedData[mainGroupKey])
      if (!this.groupedData[mainGroupKey]) return;
    
      this.groupedData[mainGroupKey].forEach(item => {
        console.log('item.perforations', item.perforations)
        const matchesSubGroup = subGroupKey ? item.subtype === subGroupKey : true;
        const matchesThirdGroup = thirdGroupKey ? item.perforations === thirdGroupKey : true;
    
        if (matchesSubGroup && matchesThirdGroup) {
          item.state = 'delete';
        }
      });
    
      this.printedGroups.clear();
      //this.prepareDataForDisplay();
      //this.parentAction.emit("save"); 
    }
    
    
    findNextMissingNumber(numbers: number[]): number {
      for (let i = 0; i < numbers.length; i++) {
        if (numbers[i + 1] && numbers[i + 1] !== numbers[i] + 1) {
          return numbers[i] + 1;
        }
      }
      return numbers[numbers.length - 1] + 1;
    }

    addRowPerforation(group: any) {
      const mainGroupKey = "Default";
      let count = 1;
    
      const defaultGroup = this.groupedData?.[mainGroupKey] ?? [];
    
      const uniquePerforations = new Set<string>();
      const filteredByTypeAndSubtype: any[] = [];
      let parentRow: any = null;
      let basePath: string = '';
    
      let [groupName, type, subtype] = group.split('<DELIM>');

      for (const item of defaultGroup) {
        if (item.perforations) {
          uniquePerforations.add(item.perforations);
        }
        console.log('addRowPerforation',item.path.split('//')[1], subtype)
        if (item.path.split('//')[1] === subtype && item.type === type) {
          filteredByTypeAndSubtype.push(item);
          if (item.perforations === 'Default') {
            parentRow = item;
            basePath = item.path.split('//').slice(0, -1).join('//');
            subtype = item.subtype;
          }
        }
      }
      console.log('subtype',subtype)
      count = uniquePerforations.size + 1;
    
      // Extract number from "DISPARO X"
      const existingNumbers = filteredByTypeAndSubtype
        .map(item => {
          const match = item.perforations?.match(/DISPARO (\d+)/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n): n is number => n !== null);
    
      const sortedUniqueNumbers = [...new Set(existingNumbers)].sort((a, b) => a - b);
      const nextNumber: number = this.findNextMissingNumber(sortedUniqueNumbers);
    
      if (!parentRow) {
        console.error('Parent row not found for subtype:', subtype);
        return;
      }
    
      this.getAttributes("StandardOilfieldOperationsSandPerforationAttributes").subscribe((data: any) => {
        const newRows = Object.keys(data).map((key: string) => {
          const attribute = data[key];
          
          return {
            type,
            subtype,
            group: groupName,
            parent: parentRow.rowid,
            campo: attribute.name,
            key: attribute.name,
            value: null,
            path: `${basePath}//DISPARO: ${count}//${attribute.name}`,
            id: 1,
            rowid: null,
            sortOrder: "",
            measurementUnit: attribute.measurementUnit,
            valorhistoricoopenwells: " ",
            valorhistoricofp2p: " ",
            valorfinal: " ",
            acciones: " ",
            perforation: "DISPAROS",
            perforations: `DISPARO: ${count}`,
            state: "new",
            tableName: "OilfieldOperationsSandPerforationAttributes",
            propertyName: "value",
            referenceTable: "StandardOilfieldOperationsSandPerforationAttributes",
            referenceProperty: "name",
            openwellsvalue: null,
            uploadState: "new",
          };
        });
    
        this.groupedData[mainGroupKey].push(...newRows);
    
        this.prepareDataForDisplay();
        // this.parentAction.emit("save");
      });
    }
    

    getDataFromLabel(label: string, dataToDisplay: any): any {
      const levels = label.split("<DELIM>");

      let currentDataLevel = dataToDisplay;

      for (const level of levels) {
        if (
          !currentDataLevel ||
          typeof currentDataLevel !== "object" ||
          !(level in currentDataLevel)
        ) {
          return null;
        }

        currentDataLevel = currentDataLevel[level];
      }

      return currentDataLevel;
    }

    addSandRow() {
      const mainGroupKey = "Default";
    
      if (!Array.isArray(this.groupedData[mainGroupKey])) {
        this.groupedData[mainGroupKey] = [];
      }
    
      let count = 1;
      if (this.groupedData[mainGroupKey]?.length) {
        const uniqueSubtypes = new Set(this.groupedData[mainGroupKey].map(item => item.subtype));
        count = uniqueSubtypes.size + 1;
      }
    
      this.getAttributes("StandardOilfieldOperationsSandAttributes").subscribe((data: any) => {
        const parent = uuidv4();
        const path = `Default//ARENAS ${count}//wellbore//`;
    
        const newRows = Object.keys(data).map((key: string) => {
          const attribute = data[key];
    
          return {
            group: "ARENAS",
            rowid: uuidv4(),
            path: path + attribute.name,
            parent: parent,
            id: 1,
            type: "Default",
            subtype: "ARENAS " + count,
            state: "new",
            campo: attribute.name,
            key: attribute.name,
            value: null,
            measurementUnit: "",
            valorhistoricoopenwells: "",
            valorhistoricofp2p: "",
            valorfinal: "",
            acciones: "",
            perforation: "Default",
            perforations: "Default",
            tableName: "OilfieldOperationsSandAttributes",
            propertyName: "idStandardOilfieldOperationsSandAttributes/value",
            referenceTable: "StandardOilfieldOperationsSandAttributes",
            referenceProperty: "name",
            openwellsvalue: null,
            uploadState: "new",
          };
        });
    
        this.groupedData[mainGroupKey].push(...newRows);
    
        this.prepareDataForDisplay();
        this.emitGroupedDataChange();
        // this.parentAction.emit("save");
      });
    }
    
    
    onCheckboxChange(group:any, row: any, col: string, event: Event) {
      const checked = (event.target as HTMLInputElement).checked;
      console.log('Checkbox changed:', { row, col, checked });  
      //row['action'] = checked;
      //this.onValueChangeDelayed(group, row, 'action', checked);

      row['action'] = checked;
      row['state']= row['state']==="new" ? "new" : 'updated';
      console.log("row after",row)
    }
    

    emitGroupedDataChange() {
      this.groupedDataChange.emit(this.groupedData);
    }

    getTrimmedGroup(group: string): string {
      return group.split(" ")[0];
    }

    show(){
      console.log(this.groupedData)
    }
    userInteractionGuard(row: any){
      if (row['state'] == 'updated' && (row['valorfinal'] == row['valorhistoricofp2p'])){
        return true
      }
      else {
        return false
      }
    }

    itsComboBox(row: any):boolean{
      return (row.key.startsWith('Attribute')) 
    }

    getAttributeIds(key: string): { attributeId: number, optionId?: number } | null {
      if (!key?.startsWith('Attributes_')) return null;
    
      const parts = key.split('_');
      const attributeId = parseInt(parts[1], 10);
      const optionId = parts[2] ? parseInt(parts[2], 10) : undefined;
    
      return { attributeId, optionId };
    }
    getOptionsForRow(row: any): any[] {
      const ids = this.getAttributeIds(row.key);
      if (!ids) return [];
      //console.log("getOptionsForRow",ids, this.equipmentOptions.filter(opt => opt.idStandardAttributes === ids.attributeId))
      return this.equipmentOptions.filter(opt => opt.idStandardAttributes === ids.attributeId);
    }

    
    
    getSelectedOptionId(row: any): string | null {
      const ids = this.getAttributeIds(row.key);
      return ids?.optionId?.toString() ?? null;
    }
    
    getShotLabel(fullPath: string, group: string): string {
      console.log('getShotLabel')
      const top = this.rowInputValues[fullPath + group + 'md_top_shot'] || '';
      const bottom = this.rowInputValues[fullPath + group + 'md_bottom_shot'] || '';
      return `${top} - ${bottom}`;
    }
    
  }
  function isFunction(component: DynamicTableComponent01, methodName: any): methodName is keyof DynamicTableComponent01 {
    return typeof component[methodName as keyof DynamicTableComponent01] === 'function';
  }

  function groupDataByColumnRec(
    data: { [key: string]: any[] },
    composedColumn: string
  ): { [groupKey: string]: any } {
    const columns = composedColumn.split('<DELIM>');
    const allItems: any[] = [];

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


