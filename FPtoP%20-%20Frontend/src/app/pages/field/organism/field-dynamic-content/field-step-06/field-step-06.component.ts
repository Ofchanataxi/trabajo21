import { Component, Input,Output, OnInit, EventEmitter } from '@angular/core';
import { StepService } from '../../../services/step.service';
import { ReportService } from '../../../services/report_services';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { GetDocumentsOfElementService } from '../../../../../services/get-documents-of-element.service';

@Component({
  selector: 'app-field-step-six',
  templateUrl: './field-step-06.component.html',
  styleUrls: ['./field-step-06.component.scss'],
})
export class FieldStepSixComponent {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;
  @Input() idOilFielOperations: any;
  @Input() idOilfieldTypeOperations: any;
  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();
  searchTerm: string = '';
  filteredData: { [key: string]: any[] };
  isSummaryAvailable: boolean;


    constructor(
      private   reportService: ReportService,
      private getDocumentsService: GetDocumentsOfElementService,
    ) {}

  ngOnInit() {
    this.checkIfSummaryAvailable();
  }

  checkIfSummaryAvailable() {
    let reportType: any;
    if (this.idOilfieldTypeOperations === 'WO')
    {
      reportType = 'sumario_wo'
    } else if (this.idOilfieldTypeOperations === 'CPI'){
      reportType = 'sumario_cpi'
    }
    this.isSummaryAvailable = !!this.findMatchingFile(reportType);
  }

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
    return this.columnConfig[columnKey]?.type || 'text';
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig[columnKey]?.label || '';
  }

generateFile() {
  const handleDownload = (resp: any) => {
    const filename = resp.filename || 'archivo.xlsx';
    const base64Data = resp.file;

    // Decodificar base64 a Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Crear link de descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (this.idOilfieldTypeOperations === 'CPI') {
    this.reportService.getExcelCPI(this.idOilFielOperations).subscribe({
      next: handleDownload,
      error: err => console.error('Download error (CPI)', err)
    });
  }

  if (this.idOilfieldTypeOperations === 'WO') {
    this.reportService.getExcelWO(this.idOilFielOperations).subscribe({
      next: handleDownload,
      error: err => console.error('Download error (WO)', err)
    });
  }
  this.reportService.getExcelTally(this.idOilFielOperations).subscribe({
      next: handleDownload,
      error: err => console.error('Download error (Tally)', err)
  })
}
showFile(file?: string) {
  let result : any;
  console.log('this.idOilfieldTypeOperations',file, this.idOilfieldTypeOperations)
  if (file) {
    result = this.findMatchingFile(file);
  } else  if (this.idOilfieldTypeOperations === 'CPI') {
    result = this.findMatchingFile('sumario_cpi');
  } else  if (this.idOilfieldTypeOperations === 'WO') {
    result = this.findMatchingFile('sumario_wo');
  } 
  //this.getDocumentsService.getFileFromPath(parametro.filepath, parametro.fileid, parametro.filename) 
  console.log('result', result)
  this.getDocumentsService.getFileFromPath(result.filePath, result.id, result.fileName)
  .subscribe(blob => {
      const blobUrl = URL.createObjectURL(blob);
    console.log('blob.type', blob.type)
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = result.fileName+'.xlsx' || 'archivo';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl); 
    });
}

findMatchingFile(searchPathPart: string): any {
  const allEntries = Object.values(this.groupedData).flat(); // Extrae todos los arrays del objeto
  console.log('allEntries', searchPathPart)
  return allEntries.find((entry: any) =>
    entry.fileExtension === `${this.idOilFielOperations}/xlsx` &&
    entry.filePath.includes(searchPathPart)
  );
}


}



