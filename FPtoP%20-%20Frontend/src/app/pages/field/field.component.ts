import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { forkJoin, Subscription, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StepService } from './services/step.service';
import { ReportService } from './services/report_services';
import { steps, Step } from './config/step-config'; 
import { columnConfigs } from './config/column-config';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StandardAttributesService } from './services/standardAttributes.service';
import { StandardElementsOptionsService } from './services/standardElementsOptions.service';
import { ActivatedRoute } from '@angular/router';
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { Validators } from '@angular/forms';


interface Row {
  id: number;
  status: string;
}

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})

export class FieldComponent implements OnInit, OnDestroy {
  groupedData: { [key: string]: any[] } = {};
  equipmentOptions: any;
  updatedFields: { 
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
  loading: boolean = true;
  subscription: Subscription;
  idOilFielOperations: string | null = null; 
  idOilfieldTypeOperations: string | null = null; 
  steps: Step[] = steps;
  observations: string = 'Escribe tus observaciones aquí';
  isSummaryAvailable: boolean;
  files: any;

  stepContents = this.steps.map(step => ({
    component: `step-${step.number.toLowerCase().replace(/ /g, '-')}`,
    data: {
      groupedData: this.groupedData,
      equipmentOptions: this.equipmentOptions,
      columnConfig: columnConfigs[step.config],
    },
  }));
  well: string;
  rig: string;
  rejectedEquipment: string;
  modifiedby: string;
  modifydate: string;
  operationNumber: string;
  equipmentOptionsLoaded = false;
  public user: UserInfo;
  private userService = inject(UserService);
  



  searchingItems = [];
  

  constructor(
    private stepService: StepService,
    private reportService: ReportService,
    public standardAttributesService: StandardAttributesService,
    public StandardElementsOptionsService: StandardElementsOptionsService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private notificationService : NotificationsService,
  ) {}

  async ngOnInit(): Promise<void> {
    
    this.getAttributes('StandardOilfieldOperationsSandAttributes').subscribe(data => {});
    this.getStandardElementsOptions().subscribe({
      next: (data) => {
        this.equipmentOptions = data;
        console.log('Equipment Options Loaded:', this.equipmentOptions);
        this.equipmentOptionsLoaded = true;
        this.cdr.detectChanges(); 
        
      },
      error: (error) => {
        console.error('Error loading equipment options:', error);
      },
    });
    
    //this.getAttributes('StandardWellInfrastructureType').subscribe(data => {});
    
    this.idOilFielOperations= this.route.snapshot.paramMap.get('idOilFieldOperations');
    
    this.getUpdateInfo(this.idOilFielOperations!)
    await this.getReports()
    this.userService.currentUser.subscribe(currentUser => {
      this.user = currentUser;
    
    });


    this.getAttributes(`oilfieldOperations/${this.idOilFielOperations}`).pipe(
      switchMap((data: any) => {
        this.operationNumber = data.operationNumber;
        //this.idOilfieldTypeOperations = data.idOilfieldTypeOperations
        return forkJoin({
          well: this.getAttributes(`well/${data.idWell}`),
          rig: this.getAttributes(`rig/${data.idRig}`),
          OilfieldTypeOperations: this.getAttributes(`OilfieldTypeOperations/${data.idOilfieldTypeOperations}`),
        });
      })
    ).subscribe({
      next: (result: { well: any; rig: any; OilfieldTypeOperations: any}) => {
        this.well = result.well.wellShortName;
        this.rig = result.rig.name;
        this.idOilfieldTypeOperations = result.OilfieldTypeOperations.operationCode;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });

    this.subscription = this.stepService.currentStep$
      .pipe(
        switchMap((step: number) => this.stepService.getDataForStep(step,this.idOilFielOperations))
      )
      .subscribe({
        next: (data: any[]) => {
          
          const currentStep = this.stepService['currentStep'].getValue();
          this.groupedData = this.stepService.groupData(data, currentStep);
          this.loading = false;
          this.cdr.detectChanges();
          
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        },
      });
    
    this.checkIfSummaryAvailable();
  }



  reloadGroupedData(): void {
    const currentStep = this.stepService['currentStep'].getValue();
    this.loading = true;
    this.getUpdateInfo(this.idOilFielOperations ?? '')
    this.stepService.reloadDataForStep(currentStep, this.idOilFielOperations).subscribe({
      next: (data: any[]) => {
        this.groupedData = this.stepService.groupData(data, currentStep);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error reloading data:', error);
        this.loading = false;
      },
    });
  }


  reloadComponent(): void {
    const currentStep = this.stepService['currentStep'].getValue();
    this.loading = true;
    this.getUpdateInfo(this.idOilFielOperations ?? '')
    this.stepService.reloadDataForStep(currentStep, this.idOilFielOperations).subscribe({
      next: (data: any[]) => {
        this.groupedData = this.groupedData;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error reloading data:', error);
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  getObject(){
    console.log('original data', this.groupedData)
  }
  getfields(){
    console.log('updated fields', this.updatedFields)
  }
  getAttributes(tableName: string): Observable<any[]> {
    return this.standardAttributesService.getStandardAttributes(tableName);
  } 

  

  getStandardElementsOptions(): Observable<any[]> {
    return this.StandardElementsOptionsService.getStandardElementsOptions();
  } 

  
  getUpdateInfo(idOilFielOperations: string): void {
    this.stepService.getUpdateInfo(idOilFielOperations).subscribe({
      next: (data) => {
        this.modifiedby = data[0].modifiedby;
        this.modifydate = data[0].modifydate;
      },
      error: (error) => {
        console.error('Error fetching update info:', error); 
      },
      complete: () => {
        console.log('Request completed'); 
      },
    });
  }

  getReports(): void {
    this.stepService.getFiles(this.idOilFielOperations).subscribe({
      next: (data) => {
        console.log('getReports',data[0].fileName)
        this.files = data[0].fileName;
        if(this.files) {this.isSummaryAvailable = true}
      },
      error: (error) => {
        console.error('Error fetching update info:', error); 
      },
      complete: () => {
        console.log('Request completed'); 
      },
    });
  }

  message: string | null = null;


  async handleAction(action: string) {
    console.log('Parent received action:', action);
  
    if (action === 'save') {
      this.saveUpdate();
    }
    if (action === 'saveAll') {
      this.saveAll();
    }
    if (action === 'notify') {
      this.notify();
    }
    if (action === 'getReports') {
      console.log('execute getReports')
      await this.getReports();
      this.message = 'Archivos generados correctamente';
      setTimeout(() => this.message = null, 3000); // Se borra en 3s
    }     
  }


  
  async handleSave(): Promise<void> {
    await this.saveUpdate('no');
  }

  updateRejectedEquipment(newValue: any) {
      this.rejectedEquipment = newValue['descripcionConcat'];
      this.observations =  newValue['ElementRelease.observations']
      console.log('Rechazado:', this.rejectedEquipment);
    }

  saveUpdate(reload?:string): Promise<void> {
    return new Promise((resolve, reject) => {
      const updatedRows: any[] = [];
  
      // Collect updated rows
      Object.keys(this.groupedData).forEach((group) => {
        Object.keys(this.groupedData[group]).forEach((key: any) => {
          const row = this.groupedData[group][key];
  
          if (row.state === "updated" || row.state === "new" || row.state === "delete") {
            updatedRows.push(row);
            
          }
        });
      });
  
      let pending = 2; // track both subscriptions
  
      const checkFinish = () => {
        pending--;
        if (pending === 0) resolve(); // only resolve when both complete
      };
  
      this.stepService.updateDataForStep(
        this.idOilFielOperations,
        updatedRows,
        this.user.id.toString()
      ).subscribe({
        next: (response: any) => {
          console.log('Update successful:', response);
          Object.keys(this.groupedData).forEach((group) => {
              Object.keys(this.groupedData[group]).forEach((key: any) => {
                const row = this.groupedData[group][key];
        
                if (row.state === "updated" || row.state === "new" ) {
                  row.state = "saved"
                  row.valorhistoricofp2p = row.valorfinal
                }
                if (row.state === "delete") {
                  row.state = "deleted"
                  row.valorhistoricofp2p = row.valorfinal
                }
              });
            });
            
        },
        error: (error: any) => {
          console.error('Error updating data:', error);
          reject(error);
        },
        complete: () => {
          console.log('Update process completed.');
          checkFinish();
        },
      });
      

      this.updatedFields.forEach(field => {
        // Solo aplicar si es ElementTally
        if (field.tableName === 'ElementTally' && field.idRow) {
          // Buscar en groupedData el grupo correcto
          const groupKeys = Object.keys(this.groupedData);
          for (const groupKey of groupKeys) {
            const group = this.groupedData[groupKey];
    
            const matchingRow = group.find(row =>
              row['idElementTally'] && String(row['idElementTally']) === String(field.idRow)
            );
    
            if (matchingRow && matchingRow['ElementTally.sequence_number'] !== undefined) {
              field.sequence_number = matchingRow['ElementTally.sequence_number'];
            }
          }
        }
      });
    



      this.stepService.updateFieldForStep(
        this.updatedFields,
        this.user.id.toString()
      ).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          if (this.updatedFields.length > 0 && reload!='no') {
              this.reloadComponent();
          }
          this.updatedFields = [];
        },
        error: (error) => {
          console.error('Error updating fields:', error);
          reject(error);
        },
        complete: () => {
          console.log('Update process completed.');
          checkFinish();
        },
      });
    });
  
  }
  
  async saveAll() {
    await this.saveUpdate();
  
    let hasDeleted = false;
  
    Object.keys(this.groupedData).forEach(group => {
      const originalLength = this.groupedData[group].length;
  
      // Filter out deleted rows
      this.groupedData[group] = this.groupedData[group].filter(row => row.state !== 'deleted');
  
      if (this.groupedData[group].length < originalLength) {
        hasDeleted = true;
      }
    });
  
    if (hasDeleted) {
      //this.reloadComponent();
    }
    this.reloadGroupedData();
  
  }
  

  saveUpdateEquipments(): void {
    const updatedRows: any[] = [];

    Object.keys(this.groupedData).forEach((group) => {
      Object.keys(this.groupedData[group]).forEach((key: any) => {
        const row = this.groupedData[group][key];

        // Loop through all keys of the row dynamically
        Object.keys(row).forEach((field) => {
          // Skip fields that end with "_original"
          if (field.endsWith("_original")) return;

          // Find the corresponding "_original" field
          const originalField = `${field}_original`;

          // Check if the "_original" field exists and compare its value to the current field
          if (
            row[originalField] !== undefined && // Ensure the _original field exists
            row[field] !== row[originalField] // Compare values for changes
          ) {
            // Dynamically construct the ID key for this field
            const idField = `id${field}`;
            console.log("rowupdated",row)
            console.log("field name",field)
            // Push the updated field into the updatedRows array
            updatedRows.push({
              id: row["id"+field], 
              value: row[field], 
              tableName: field, 
            });
          }
        });
      });
    });
  
    console.log("Generated Objects for Update:", updatedRows);
  
    // Send the updated rows to the backend
    /*this.stepService.updateDataForStep(this.idOilFielOperations, updatedRows).subscribe({
      next: (response: any) => {
        console.log("Update successful:", response);
      },
      error: (error: any) => {
        console.error("Error updating data:", error);
      },
    });*/

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
    this.updatedFields = updatedFields; 
    //this.updatedFields = [...this.updatedFields, ...updatedFields];


  }
  onGroupedDataChange(updatedGroupedData: { [key: string]: any[] }) {
    this.groupedData = updatedGroupedData;
    //this.saveAll();
  }

  printUpdatedFields(){
    const updatedRows: any[] = [];

    Object.keys(this.groupedData).forEach(group => {
      const rows = this.groupedData[group];
      rows.forEach(row => {
        if (row.state === "updated" || row.state === "new" || row.state === "delete") {
          updatedRows.push(row);
        }
      });
    });
    console.log(updatedRows);
    console.log(this.updatedFields)
  }

  getPendingChanges():boolean{
    const updatedRows: any[] = [];

    Object.keys(this.groupedData).forEach(group => {
      const rows = this.groupedData[group];
      rows.forEach(row => {
        if (row.state === "updated" || row.state === "new" || row.state === "delete"){
          updatedRows.push(row);
        }
      });
    });
    return updatedRows.length > 0 || this.updatedFields.length > 0;
  }

  printequipments(){
    console.log(this.equipmentOptions)
  }

  notify() {
  const dataToNotificate = {
        estadoActual: "De QAQC a Logistica",
        pozoActual: this.well,
        nameWell: this.well,
        updateDate: new Date(),
        observation: this.observations,
        user: this.user.nameUser,
        rejectedEquipment: this.rejectedEquipment,
        idStandardStates: 4,

  };
  console.log('notify')
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
deleteByOilfieldOperations() {
  const confirmed = window.confirm("⚠️ Todos los datos serán borrados. ¿Está seguro?");
  if (confirmed) {

  if (this.idOilFielOperations) {
    this.stepService.deleteDataByOilfieldOperationsForStep(this.idOilFielOperations)
      .subscribe({
        next: () => {
          // Only reload after successful deletion
          this.reloadGroupedData();
        },
        error: (err) => {
          console.error('Error deleting data:', err);
        }
      });
  } else {
    // If no ID, reload immediately or do nothing
    this.reloadGroupedData();
  }
}
}
download(type: 'excel' | 'word') {
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


  findMatchingFile(searchPathPart: string): any {
    const allEntries = Object.values(this.groupedData).flat();

    return allEntries.find((entry: any) =>
      entry.fileExtension === `${this.idOilFielOperations}/xlsx` &&
      entry.filePath.includes(searchPathPart)
    );
  }

}


  
