import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { FieldFileUploadComponent } from '../../../atoms/file-upload/file-upload.component';
import { GenericRequestPageComponent } from '../../../generic-request-page/generic-request-page.component'
import { catchError, map, Observable, of } from 'rxjs';
import { StandardAttribute } from '../../../interfaces/interfaces.interfaces';
import { StandardAttributesService } from '../../../services/standardAttributes.service';
import { v4 as uuidv4 } from 'uuid';
import { DynamicTableComponent01 } from './dynamic-table_01/dynamic-table_01.component';

@Component({
  selector: "app-field-step-one",
  templateUrl: "./field-step-01.component.html",
  styleUrls: ["./field-step-01.component.scss"],
})
export class FieldStepOneComponent implements OnChanges, AfterViewInit {
  @Input() searchingItems: any[];
  @Input() groupedData: { [key: string]: any[] };
  @Input() idOilFielOperations: any;
  
  @Input() columnConfig: any;
  @Input() reloadGroupedData: () => void;
  @Input() user: any;
  @Input() getAttributes: (tableName: string) => Observable<any[]>;
  @Input() getStandardElementsOptions: () => Observable<any[]>;
  @Input() onDeleteByOilfieldOperations: () => Observable<any[]>;
  @Input() standardAttributesService: any;
  @Input() equipmentOptions: any[] = [];

  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  @Output() groupedDataChange = new EventEmitter<{ [key: string]: any[] }>();
  @Output() parentAction = new EventEmitter<string>;

  @ViewChild(FieldFileUploadComponent)
  fileUploadComponent: FieldFileUploadComponent;
  @ViewChild("genericRequestPage_AddElement")
genericRequestPage_AddElement: GenericRequestPageComponent;
@ViewChild("genericRequestPage_AddEquipment")
genericRequestPage_AddEquipment: GenericRequestPageComponent;
  @ViewChild(DynamicTableComponent01) dynamicTableComponent01!: DynamicTableComponent01;

  //standardAttributesService2: StandardAttributesService;
  showXmlInfo: boolean = false;
  searchTerm: string = "";
  filteredData: { [key: string]: any[] };
  selectedSeccion: any;
  selectedElement: string | null = null;
  selectedElementObject: {
    elementId: string;
    value: string;
  } | null = null;
  selectedEquipment: any;
  selectedStandardElement: any;
  selectedBusinessLine: any;
  selectedInfrastructureType: any;


  secciones: any[] = [];
  elements: any[] = [];
  equipments: any[] = [];
  standardElements: any[] = [];
  allElements: any[] = [];
  allEquipments: any[] = [];
  allStandardElements: any[] = [];
  attributeOptions: { [attributeName: string]: string[] } = {};
  attributeOptionsArray: any[] = [];
  //selectedAttributes: { [key: string]: string } = {};
  selectedAttributes: {
    [attributeName: string]: { attributeId: string, optionId: string, value: string, orderInDescription: string }
  } = {};

  businessLines: string[] = [];
  infrastructureTypes: string[] = [];
  filteredElements: string[] = [];

  constructor(private standardAttributesService2: StandardAttributesService) {}

  @HostListener("document:keydown.escape", ["$event"])
  handleEscKey(event: KeyboardEvent): void {
    this.cancelOverlay();
  }

  ngOnInit(): void {
    if (!this.columnConfig) {
      this.columnConfig = {};
    }
    this.populateSecciones();
    this.populateSeccionesOptions();
    this.populateEquipments();
    this.populateEquipmentOptions();
    this.extractBusinessLines();
  }
  ngAfterViewInit(): void {
    if (this.fileUploadComponent) {
      this.fileUploadComponent.uploadSuccess.subscribe(() => {
        this.handleFileUploadSuccess();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.groupedData) {
      this.filteredData = { ...this.groupedData } || {};
    }
    if (changes.columnConfig) {
      this.columnConfig = changes.columnConfig.currentValue || {};
    }
  }
  populateSecciones() {
    if (this.groupedData) {
      const allRows = Object.values(this.groupedData).flat();
      this.secciones = [...new Set(allRows.map((row) => row["type"]))];
    }
  }

  populateEquipments() {
    if (this.groupedData) {
      const allRows = Object.values(this.groupedData).flat();
      this.equipments = [...new Set(allRows.map((row) => row["type"]))];
    }
  }



  fetchSelectOptions(tableName: string): Observable<string[]> {
    return this.standardAttributesService2
      .getStandardAttributes(tableName)
      .pipe(
        map((data: any[]) => data.map((item) => ({ ...item }))),
        catchError((error) => {
          console.error("Error fetching options:", error);
          return of([]);
        })
      );
  }

hasRawData(): boolean {
  return Object.values(this.groupedData).some(group =>
    group.some((item: any) => item.state === 'raw')
  );
}

  addRow(event: any) {
    const data = this.getAttributes("StandardOilfieldOperationsSandAttributes");
    data.forEach((row: any) => {
      row.forEach((attribute: any) => {
        const newRow = {
          type: this.selectedSeccion.name,
          subtype: "Default",
          campo: attribute.name,
          sortOrder: 1,
          state: attribute.state === "new" ? "new" : "updated", 
          valorhisoticoopenwells: "",
          valorhistoricofp2p: "",
          valorfinal: "",
          acciones: "",
          perforation: "Default",
          perforations: "Default",
        };
        const mainGroupKey = this.selectedSeccion.name;
        const newGroupData = { ...this.groupedData };

        if (newGroupData[mainGroupKey]) {
          newGroupData[mainGroupKey] = [...newGroupData[mainGroupKey], newRow];
        } else {
          console.error(`Group '${mainGroupKey}' not found in groupedData`, this.groupedData);
        }

        this.groupedData = newGroupData;
      });
    });
    this.genericRequestPage_AddElement.closeOverlay();
    console.log("termino");
    this.emitGroupedDataChange();

  }

  addSeccionRow(event: any) {
    const newRow = {
      group: "GENERAL",
      path: `${this.selectedSeccion}//${this.selectedElement}`,
      id: null,
      rowid: null,
      type: this.selectedSeccion,
      subtype: "Default",
      state: "new",
      campo: this.selectedElement,
      key: this.selectedElement,
      value: null,
      measurementUnit: "",
      valorhistoricoopenwells: "",
      valorhistoricofp2p: "",
      valorfinal: "",
      acciones: "",
      perforation: "Default",
      perforations: "Default",
      tableName: "oilfieldOperationsData",
      propertyName: "idStandardOilfieldOperationsDataSectionElement/value",
      referenceTable: "StandardOilfieldOperationsDataSectionElement",
      referenceProperty: "nameOpenWells",
      openwellsvalue: null,
      uploadState: "new",
    };
  
    const currentGroup = this.groupedData[this.selectedSeccion] || [];
    const updatedGroup = [...currentGroup, newRow];
  
    this.groupedData = {
      ...this.groupedData,
      [this.selectedSeccion]: updatedGroup,
    };
  
    this.genericRequestPage_AddElement.closeOverlay();
    this.emitGroupedDataChange();
  }
  
  compareAttributeOptions(o1: any, o2: any): boolean {
    return o1 && o2 &&
           o1.attributeId === o2.attributeId &&
           o1.optionId === o2.optionId &&
           o1.value === o2.value;
  }
  addEquipment(event: any) {
    const parent = uuidv4();
    const newGroupData = { ...this.groupedData };
    const mainGroupKey = this.selectedInfrastructureType;
    const concatValues_subtype = this.selectedElement+', '+Object.values(this.selectedAttributes)
          .filter(attr => attr && attr.value !== undefined)
          .sort((a, b) => Number(a.orderInDescription) - Number(b.orderInDescription))
          .map(attr => attr.value)
          .join(', ');
    // Ensure group exists
    if (!newGroupData[mainGroupKey]) {
      newGroupData[mainGroupKey] = [];
    }
  
    // Add static rows for md_top, md_base, quantity
    const staticAttributes = [
      { key: "md_top", campo: "mdBase" },
      { key: "md_base", campo: "mdTop" },
      { key: "quantity", campo: "quantity" },
      { key: "catalog_key_desc", campo: "catalog_key_desc" }
    ];
  
    staticAttributes.forEach(attr => {
      const newRow = {
        type: this.selectedInfrastructureType,
        subtype: concatValues_subtype,
        group: "EQUIPOS",
        id: this.idOilFielOperations,
        rowid: null,
        path: `ensambles//${this.selectedInfrastructureType}//componentes//${attr.campo}//${parent}`,
        measurementUnit: "",
        key: attr.key,
        campo: attr.campo,
        sortOrder: 1,
        state: "new",
        valorhistoricoopenwells: "",
        valorhistoricofp2p: attr.key === 'catalog_key_desc' ? concatValues_subtype: "",
        acciones: "",
        perforation: "Default",
        perforations: "Default",
        action: null,
        value: attr.key === 'catalog_key_desc' ? concatValues_subtype: null,
        valorfinal: attr.key === 'catalog_key_desc' ? concatValues_subtype: null,
        tableName: "WellHistoricalInfrastructureElements",
        propertyName: attr.key === 'catalog_key_desc' ? 'openWellsDescription':attr.campo,
        referenceTable: null,
        referenceProperty: null,
        uploadState: "new",
        openwellsvalue: null,
        parent: parent,
      };
      newGroupData[mainGroupKey].push(newRow);
    });
console.log('this.selectedElementObject',this.selectedElementObject)
    const idElementRow = {
      type: this.selectedInfrastructureType,
      subtype: concatValues_subtype,
      group: "EQUIPOS",
      id: this.idOilFielOperations,
      rowid: null,
      path: `ensambles//${this.selectedInfrastructureType}//componentes//idElement//${parent}`,
      measurementUnit: "",
      key: "idElement",
      campo: "idElement",
      sortOrder: 1,
      state: "new",
      valorhistoricoopenwells: "",
      valorhistoricofp2p: "",
      acciones: "",
      perforation: "Default",
      perforations: "Default",
      action: null,
      value: this.getSelectedElementId(), // 👈 función que retorna el id del elemento seleccionado
      valorfinal: this.getSelectedElementId(),
      tableName: "WellHistoricalInfrastructureElementsDetail", // 👈 tabla especial
      propertyName: "idElement",
      referenceTable: null,
      referenceProperty: null,
      uploadState: "new",
      openwellsvalue: null,
      parent: parent,
    };
    
    newGroupData[mainGroupKey].push(idElementRow);
    
  
    // Add rows for each selected attribute
    console.log("this.selectedAttributes", this.selectedAttributes)
    

    Object.entries(this.selectedAttributes).forEach(([attributeName, selectedObj]) => {
      if (!selectedObj || !selectedObj.attributeId) return;
    
      const attributeId = selectedObj.attributeId;
      const optionId = selectedObj.optionId;
      const value = selectedObj.value;
      
    
      const key = optionId ? `Attributes_${attributeId}_${optionId}` : `Attributes_${attributeId}`;
    
      const newRow = {
        type: this.selectedInfrastructureType,
        subtype: concatValues_subtype,
        group: "EQUIPOS",
        id: this.idOilFielOperations,
        rowid: null,
        path: `ensambles//${this.selectedInfrastructureType}//componentes//${value}//${parent}`,
        measurementUnit: "",
        key: key,
        campo: attributeName,
        sortOrder: 1,
        state: "new",
        valorhistoricoopenwells: "",
        valorhistoricofp2p: "",
        acciones: "",
        perforation: "Default",
        perforations: "Default",
        action: null,
        value: value,
        valorfinal: value,
        tableName: "WellHistoricalInfrastructureElementsDetail",
        propertyName: "openWellsDescription",
        referenceTable: null,
        referenceProperty: null,
        uploadState: "new",
        openwellsvalue: null,
        parent: parent,
      };
    
      newGroupData[mainGroupKey].push(newRow);
    });
    
  
    // Update state
    this.groupedData = newGroupData;
    this.genericRequestPage_AddElement.closeOverlay();
    this.emitGroupedDataChange();
  }
  


  eraseRawData(): void {
    Object.keys(this.groupedData).forEach(groupKey => {
      this.groupedData[groupKey].forEach(item => {
        if (item.state === 'raw') {
          item.state = 'delete';
        }
      });
    });
  
    //this.prepareDataForDisplay();
  }

  cancelOverlay() {
    //this.genericRequestPage_AddElement.closeOverlay();
    console.log('cancelOverlay')
    this.genericRequestPage_AddEquipment.closeOverlay();
  }
  cancelOverlayElement() {
    //this.genericRequestPage_AddElement.closeOverlay();
    
    this.genericRequestPage_AddElement.closeOverlay();
  }

  removeRowsBySeccion() {
    if (this.selectedSeccion) {
      this.filteredData["Default"] = this.filteredData["Default"].filter(
        (row) => row["Type"] !== this.selectedSeccion
      );

      if (this.reloadGroupedData) {
        this.reloadGroupedData();
      }
    }
    
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getColumnKeys(group: string): string[] {
    return this.groupedData[group] && this.groupedData[group].length > 0
      ? Object.keys(this.groupedData[group][0]).filter((key) => key !== "type")
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

  getColumnType(columnKey: string): string {
    return this.columnConfig[columnKey]?.type || "text";
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig[columnKey]?.label || "";
  }

  filterElements(): void {
    //console.log('this.selectedSeccion.id',this.secciones, this.secciones.filter(seccion => seccion.name === this.selectedSeccion))
    if (this.selectedSeccion) {
      const selectedSeccionId = this.secciones.find(
        (seccion) => seccion.name === this.selectedSeccion
      ).id;

      this.elements = this.allElements.filter(
        (element) =>
          element.idStandardOilfieldOperationsDataSection === selectedSeccionId
      );
    } else {
      this.elements = [];
    }
  }

  filterStandardElements(): void {
    console.log('this.selectedEquipment',this.selectedEquipment)
    if (this.selectedEquipment) {
      const selectedId = this.equipments.find(
        (equipment) => equipment.name === this.selectedEquipment
      ).id;

      this.standardElements = this.allStandardElements.filter(
        (element) =>
          element.idStandardWellInfrastructureType === selectedId
      );
    } else {
      this.elements = [];
    }
  }

  onSectionChange(): void {
    this.filterElements();
  }
  onEquipmentChange(): void {
    console.log('onEquipmentChange',this.allStandardElements)
    this.filterStandardElements();
  }
  populateSeccionesOptions() {
    this.fetchSelectOptions("StandardOilfieldOperationsDataSection").subscribe(
      (options: any[]) => {
        this.secciones = options;
      }
    );
    this.fetchSelectOptions("StandardOilfieldOperationsDataSectionElement").subscribe(
      (options: any[]) => {
        this.allElements = options;
      }
    );
  }




  populateEquipmentOptions() {
    this.fetchSelectOptions("StandardWellInfrastructureType").subscribe(
      (options: any[]) => {
        this.equipments = options;
      }
    );
    this.fetchSelectOptions("StandardElements").subscribe(
      (options: any[]) => {
        this.allStandardElements = options;
      }
    );
  }



  handleFileUploadSuccess() {
    if (this.reloadGroupedData) {
      this.reloadGroupedData();
    }

    this.showXmlInfo = true;
  }
  show(){
    console.log(this.groupedData)
  }

  emitGroupedDataChange() {
    this.groupedDataChange.emit(this.groupedData);
  }
  onGroupedDataChange(updatedData: any){
      this.groupedData = updatedData
      this.emitGroupedDataChange() 
  }

  extractBusinessLines() {
    this.businessLines = Array.from(
      new Set(this.equipmentOptions.map(opt => opt.business_line_name).filter(name => name))
    );
  }

  onBusinessLineChange() {
    this.infrastructureTypes = Array.from(
      new Set(this.equipmentOptions
        .filter(opt => opt.business_line_name === this.selectedBusinessLine)
        .map(opt => opt.standardwellinfrastructuretypename)
      )
    );
    this.selectedInfrastructureType = null;
    this.selectedElement = null;
    this.filteredElements = [];
    this.attributeOptionsArray = [];

    setTimeout(() => {
      this.selectedInfrastructureType = '';
      this.selectedElement = '';
    });
  }

  onInfrastructureTypeChange() {
    this.filteredElements = Array.from(
      new Set(this.equipmentOptions
        .filter(opt => opt.business_line_name === this.selectedBusinessLine &&
                       opt.standardwellinfrastructuretypename === this.selectedInfrastructureType)
        .map(opt => opt.name)
      )
    );
    this.selectedElement = null;
    this.attributeOptionsArray = [];

    setTimeout(() => {
      this.selectedElement = '';
    });
  }

  onElementChange() {
    this.selectedelement();
  
    const match = this.equipmentOptions.find(opt =>
      opt.name === this.selectedElement &&
      opt.business_line_name === this.selectedBusinessLine &&
      opt.standardwellinfrastructuretypename === this.selectedInfrastructureType
    );
  
    this.selectedElementObject = match
      ? { elementId: match.idStandardElement, value: match.name }
      : null;
  }
  
  getSelectedElementId(): string | null {
    return this.selectedElementObject?.elementId || null;
  }

  getSelectedElementValue(): string | null {
  return this.selectedElementObject?.value || null;
}
  selectedelement() {
    if (!this.selectedElement) {
      this.attributeOptions = {};
      this.attributeOptionsArray = [];
      return;
    }
    let matches = this.equipmentOptions.filter(opt =>
      opt.name === this.selectedElement &&
      opt.business_line_name === this.selectedBusinessLine &&
      opt.standardwellinfrastructuretypename === this.selectedInfrastructureType
    );

    matches = matches.sort((a, b) => (a.orderInDescription || 0) - (b.orderInDescription || 0));

    const attributeOptions: { [attributeName: string]: string[] } = {};
    matches.forEach((match: any) => {
      const attrName = match.attribute_name;
      const value = match.value;
      if (!attributeOptions[attrName]) {
        attributeOptions[attrName] = [];
      }
      if (!attributeOptions[attrName].includes(value)) {
        attributeOptions[attrName].push(value);
      }
    });

    this.attributeOptions = attributeOptions;
    this.attributeOptionsArray = Object.entries(attributeOptions);
  }



  handleAction(action: string){
    console.log("handleAction field step 01", action)
    this.parentAction.emit(action);
  }

  printequipment(){
    console.log( this.equipmentOptions)
  }
  
  getSelectedValuesConcatenated(): string {
    const selectedValues = Object.values(this.selectedAttributes).filter(v => v); // Only non-empty
    console.log("selectedValues.join(', ');",selectedValues.join(', '))
    return selectedValues.join(', ');
  }

  onEraseAllGroups() {
    this.onDeleteByOilfieldOperations();

    //this.dynamicTableComponent01.eraseAllGroups();
  }

  getOptionsWithIds(attributeName: string, values: string[]) {
    return values.map(value => {
      const match = this.equipmentOptions.find(opt =>
        opt.attribute_name === attributeName &&
        opt.value === value &&
        opt.name === this.selectedElement &&
        opt.business_line_name === this.selectedBusinessLine &&
        opt.standardwellinfrastructuretypename === this.selectedInfrastructureType
      );
  
      return {
        attributeId: match?.idStandardAttributes || 'UNKNOWN',
        optionId: match?.idStandardAttributeOptions || null,
        value: value
      };
    });
  }

  getSelectedAttribute(attributeName: string) {
    return this.selectedAttributes[attributeName] || null;
  }
  
  onAttributeChange(attributeName: string, selectedOption: any, options: string[]) {
    if (!selectedOption || !selectedOption.attributeId) {
      delete this.selectedAttributes[attributeName]; // si se borra
      return;
    }
  
    this.selectedAttributes[attributeName] = {
      attributeId: selectedOption.attributeId,
      optionId: selectedOption.optionId,
      value: selectedOption.value,
      orderInDescription: selectedOption.orderInDescription
    };
  }
  
}

