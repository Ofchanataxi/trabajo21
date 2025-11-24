import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReportService } from '../../../services/report_services';

@Component({
  selector: 'app-field-step-five',
  templateUrl: './field-step-05.component.html',
  styleUrls: ['./field-step-05.component.scss'],
})
export class FieldStepFiveComponent {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;
  @Input() idOilfieldTypeOperations: any;
  @Input() idOilFielOperations:any;
  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  @Output() parentAction = new EventEmitter<string>;

  searchTermTable1: string = ''; 
  searchTermTable2: string = ''; 

  filteredData: { [key: string]: any[] };

  constructor(
        private   reportService: ReportService,
      ) {}
  
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getColumnKeys(group: string): string[] {
    return this.groupedData[group] && this.groupedData[group].length > 0
      ? Object.keys(this.groupedData[group][0]).filter(key => key !== 'columnA')
      : [];
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

  onSearch(event: any) {
    this.search.emit(event);
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

  getColumnType(columnKey: string): string {
    return this.columnConfig[columnKey]?.type || 'text';
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig[columnKey]?.label || '';
  }

  generateFile() {
  const handleResponse = (resp: any) => {
    const message = resp.message || 'Archivo cargado correctamente';
    console.log(message);
    this.parentAction.emit("getReports");

  };

  const handleError = (err: any) => {
    console.error('Error al generar archivo', err);
  };

  if (this.idOilfieldTypeOperations === 'CPI') {
    this.reportService.getExcelCPI(this.idOilFielOperations).subscribe({
      next: handleResponse,
      error: handleError,
    });
  }

  if (this.idOilfieldTypeOperations === 'WO') {
    this.reportService.getExcelWO(this.idOilFielOperations).subscribe({
      next: handleResponse,
      error: handleError,
    });
  }
  this.reportService.getExcelTally(this.idOilFielOperations).subscribe({
      next: handleResponse,
      error: err => console.error('Download error (Tally)', err)
  })
  this.reportService.getExcelDH(this.idOilFielOperations, this.idOilfieldTypeOperations).subscribe({
      next: handleResponse,
      error: err => console.error('Download error (DH)', err)
  })
}


generateFile1() {
  const handleResponse = (resp: any) => {
    const message = resp.message || 'Archivo cargado correctamente';
    console.log(message);
    this.parentAction.emit("getReports");

  };

  const handleError = (err: any) => {
    console.error('Error al generar archivo', err);
  };
  this.reportService.getExcelDH(this.idOilFielOperations, this.idOilfieldTypeOperations).subscribe({
      next: handleResponse,
      error: err => console.error('Download error (DH)', err)
  })
}
}