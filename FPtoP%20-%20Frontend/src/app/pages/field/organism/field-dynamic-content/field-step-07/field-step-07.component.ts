import { Component, Input,Output, OnInit, EventEmitter } from '@angular/core';
import { StepService } from '../../../services/step.service'; 
import { ReportService } from '../../../services/report_services';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { GetDocumentsOfElementService } from '../../../../../services/get-documents-of-element.service';


@Component({
  selector: 'app-field-step-seven',
  templateUrl: './field-step-07.component.html',
  styleUrls: ['./field-step-07.component.scss'],
})
export class FieldStepSevenComponent {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;
  @Input() idOilFielOperations: any;
  @Input() idOilfieldTypeOperations: any;
  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();

   constructor(
      private   reportService: ReportService,
      private getDocumentsService: GetDocumentsOfElementService,
    ) {}


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

  
showFile() {
  let result : any;
  if (this.idOilfieldTypeOperations === 'CPI') {
    result = this.findMatchingFile('sumario_cpi');
  } else  if (this.idOilfieldTypeOperations === 'WO') {
    result = this.findMatchingFile('sumario_wo');
  }
  //this.getDocumentsService.getFileFromPath(parametro.filepath, parametro.fileid, parametro.filename) 

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

  return allEntries.find((entry: any) =>
    entry.fileExtension === `${this.idOilFielOperations}/xlsx` &&
    entry.filePath.includes(searchPathPart)
  );
}

}



