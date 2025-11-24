import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WellInformationService } from './well-information.service';
import { WellElementsService } from './well-elements.service'; 
import { StandardAttributesService } from './standardAttributes.service';

@Injectable({
  providedIn: 'root',
})
export class StepService {
  private currentStep = new BehaviorSubject<number>(0);
  currentStep$ = this.currentStep.asObservable();

  constructor(
    private wellInformationService: WellInformationService,
    private wellElementsService: WellElementsService,
    private standardAttributesService: StandardAttributesService
    
  ) {}

  getFiles(idOilFielOperations: any){
    return this.wellInformationService.getwellReports(idOilFielOperations)
  }
  setCurrentStep(step: number) {
    this.currentStep.next(step);
  }

  getDataForStep(step: number, idOilFielOperations: string | null): Observable<any[]> {
    if (step === 0) {
      return this.wellInformationService.getWellInformation(idOilFielOperations);
    }if (step === 4){
      return this.wellElementsService.getWellElements(idOilFielOperations);
    }
    if (step === 5){
      return this.wellElementsService.getReports(idOilFielOperations);
    }
    if (step === 6){
      return this.wellElementsService.getReports(idOilFielOperations);
    }
    if (step === 2){
      console.log('step',step)
      return this.wellElementsService.getTallyElements(idOilFielOperations);
    } else {
      return this.wellElementsService.getWellElements(idOilFielOperations);
    }
  }
  getStandardAttributes(tableName: string): Observable<any []>{
    return this.standardAttributesService.getStandardAttributes(tableName)
  }
  getUpdateInfo(idOilFielOperations: string): Observable<any []>{
    return this.wellElementsService.getUpdateInfo(idOilFielOperations)
  }
  
  groupData(data: any[], step: number): { [key: string]: any[] } {
    const groupedData: { [key: string]: any[] } = {};
    data.forEach(row => {
      const key = row.type;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(row);
    });
    return groupedData;
  }
  reloadDataForStep(step: number, idOilFielOperations: string | null): Observable<any[]> {
    return this.getDataForStep(step, idOilFielOperations);  
  }
  updateDataForStep(idOilFielOperations: string | null, updatedRows: any, user: string| null): Observable<any[]>{
    return this.wellElementsService.updateRows(idOilFielOperations, updatedRows, user)
  }

  updateFieldForStep(updatedFields: any, user: string | null): Observable<any[]>{
    return this.wellElementsService.updateFields(updatedFields, user)
  }
  deleteDataByOilfieldOperationsForStep(idOilfieldOperations: string): Observable<any[]>{
    return this.wellElementsService.deleteByIdOilfieldOperations(idOilfieldOperations)
  }
}
