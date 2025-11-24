import { Component, Input, OnInit,EventEmitter, ComponentFactoryResolver, ViewContainerRef, ViewChild, SimpleChanges, OnChanges, Output } from '@angular/core';
import { StepService } from '../../services/step.service';
import { FieldStepOneComponent } from './field-step-01/field-step-01.component';
import { FieldStepTwoComponent } from './field-step-02/field-step-02.component';
import { FieldStepThreeComponent } from './field-step-03/field-step-03.component';
import { FieldStepFourComponent } from './field-step-04/field-step-04.component';
import { FieldStepFiveComponent } from './field-step-05/field-step-05.component';
import { FieldStepSixComponent } from './field-step-06/field-step-06.component';
import { FieldStepSevenComponent } from './field-step-07/field-step-07.component';
import { Observable } from 'rxjs';
import { AppFieldRunBesComponent } from './field-run-bes/field-run-bes.component';



@Component({
  selector: 'app-field-dynamic-content',
  templateUrl: './field-dynamic-content.component.html',
  styleUrls: ['./field-dynamic-content.component.scss'],
})
export class FieldDynamicContentComponent implements OnInit, OnChanges {
  @Input() stepContents: any[];
  @Input() searchingItems: any[];
  @Input() groupedData: any = {};
  @Input() equipmentOptions: any = {};
  @Input() isSummaryAvailable: any;
  
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

  @Input() reloadGroupedData: () => void;
  @Input() getAttributes: (tableName: string) =>  Observable<any[]>;
  @Input() getStandardElementsOptions: () =>  Observable<any[]>;
  @Input() standardAttributesService: any;
  @Input() idOilFielOperations: any;
  @Input() idOilfieldTypeOperations: any;
  @Input() user: any;
  @Input() well: any;
  @Input() observations: string;
  @Input() onDeleteByOilfieldOperations!: (id: string) => void;

  @Output() groupedDataChange = new EventEmitter<{ [key: string]: any[] }>();
  @Output() rejectedEquipmentChange = new EventEmitter<any>();
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

  currentStep: number = 0;

  @ViewChild('fieldDynamicComponentContainer', { read: ViewContainerRef, static: true }) container: ViewContainerRef;

  constructor(private stepService: StepService, private resolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    this.stepService.currentStep$.subscribe(step => {
    this.updatedFields = []
    this.updatedFieldsChange.emit(this.updatedFields);
    
      this.currentStep = step;
      this.loadComponent(step);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stepContents) {
      this.loadComponent(this.currentStep);
    } else 
    if (changes.groupedData) {
      this.loadComponent(this.currentStep);
    }
  }


  loadComponent(step: number) {
    console.log('loadcomponent', this.currentStep)
    if (step === 5 || step ===6 ){
      console.log('step 6', this.isSummaryAvailable)
      if (!this.isSummaryAvailable) return
    }
    this.container.clear();
    const content = this.stepContents[step];
    
    if (content) {
      const component = this.getComponentByName(content.component);
      const factory = this.resolver.resolveComponentFactory(component);
      const componentRef = this.container.createComponent(factory);
      const instance = componentRef.instance as any;
  
      Object.keys(content.data).forEach(key => instance[key] = content.data[key]);
      instance.searchingItems = this.searchingItems;
      instance.groupedData = this.groupedData;
      instance.updatedFields = this.updatedFields;
      instance.equipmentOptions = this.equipmentOptions;
      instance.getStandardElementsOptions = this.getStandardElementsOptions;
      instance.onDeleteByOilfieldOperations = this.onDeleteByOilfieldOperations;
      instance.idOilFielOperations = this.idOilFielOperations;
      instance.idOilfieldTypeOperations = this.idOilfieldTypeOperations;
      instance.reloadGroupedData = this.reloadGroupedData;
      instance.user = this.user;
      instance.well = this.well;
      instance.observations = this.observations;
      instance.getAttributes = this.getAttributes;
  
      // Listen for updatedFieldsChange event from step components
      if (instance.updatedFieldsChange) {
        instance.updatedFieldsChange.subscribe((updatedFields: any) => {
          this.updatedFieldsChange.emit(updatedFields);
          });
      }
      if (instance.groupedDataChange) {
        instance.groupedDataChange.subscribe((updatedGroupedData: any) => {
          this.groupedData = updatedGroupedData;
          this.groupedDataChange.emit(this.groupedData);
          });
      }
      if (instance.rejectedEquipmentChange) {
        instance.rejectedEquipmentChange.subscribe((rejectedEquipmentChange: any) => {
          this.groupedData = rejectedEquipmentChange;
          this.rejectedEquipmentChange.emit(rejectedEquipmentChange);
          });
      }      
      if (instance.parentAction) {
        instance.parentAction.subscribe((action: string) => {
          this.parentAction.emit(action); 
        });
      }
      
    }
  }
  

  getComponentByName(name: string) {
    const components: { [key: string]: any } = {
      "step-one": FieldStepOneComponent,
      "step-two": FieldStepTwoComponent,
      "step-three": FieldStepThreeComponent,
      "step-four": FieldStepFourComponent,
      "step-five": FieldStepFiveComponent,
      "step-six": FieldStepSixComponent,
      "step-seven": FieldStepSevenComponent,
      "step-eight": AppFieldRunBesComponent,
    };
    return components[name];
  }

  displayupdatedFields(){
    console.log('displayupdatedFields', this.updatedFields)
  }

  
  
}
