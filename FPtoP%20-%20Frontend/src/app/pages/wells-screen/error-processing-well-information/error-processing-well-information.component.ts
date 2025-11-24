import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MessageService, SlbMessage, SlbSeverity } from "@slb-dls/angular-material/notification";
import { LogisticService } from "src/app/features/logistic/services/logistic.service";

@Component({
  selector: "app-error-processing-well-information",
  templateUrl: "./error-processing-well-information.component.html",
  styleUrls: ["./error-processing-well-information.component.scss"],
})
export class ErrorProcessingWellInformationComponent implements OnInit {
  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    console.log("errorList", this.errorList);
    console.log("errorItems", this.errorItems);
    
    this.fixedElements = this.errorList;
    this.cdr.detectChanges();
  }
  @Input() errorList: any[] = [];
  @Input() errorItems: any[];
  @Input() idBusinessLineArray: number[] = [];
  @Input() elementsArray: any[] = [];
  inputElementName: string = '';
  newErrorElement: string;
  nameElementParts: any[] = [];
  attributePartsError: any[] = [];
  control = new FormControl();
  fixedElements: any[] = [];
  selectedAttributesKeys: string[] = []; 
  selectedTrueAttributesOptions: { [key: string]: any[] } = {}; 
  selectedElements: { [key: string]: string } = {}; 
  fixedItems: any[] = [];
  selectedElement: any = null;
  attributesText: string = '';
  textCondition: string = '';
  areFieldsComplete = false;
  addedElementsFromChild: any[] = [];
  selectedElementValue: any;
  attributeOptions: { [key: string]: string[] } = {};
  initialAttributes: string[] = [];
  remainingAttributes: string[] = [];
  matchingElement: any;
  addTextElement: string = '';
  valueCondition: { viewText: string, attrId: number };
  private logisticService = inject(LogisticService);

  @Output() goBackEvent = new EventEmitter<boolean>();
  @Output() selectionChange = new EventEmitter<any>();
  @Output() updateDataEvent = new EventEmitter<void>(); 
  @Output() errorDataRevision = new EventEmitter<any[]>(); 
  @Output() errorListChange = new EventEmitter<any[]>(); // Emite cambios al padre

  onElementSelected(element: any): void {
    this.selectedElementValue = element; 
    this.matchingElement = this.elementsArray.find(
      (item: any) => item.description === this.selectedElementValue.viewText
    );
    if (this.matchingElement.condition === "NUEVO") {
      this.valueCondition = {
        viewText: "Nuevo", // "Nuevo"
        attrId: 25,    // Por ejemplo, 25
      };
      this.textCondition = this.valueCondition.viewText+" - ";
    }
    if (this.matchingElement.condition === "INSPECCIONADO") {
      this.valueCondition = {
        viewText: "Inspeccionado", // "Inspeccionado"
        attrId: 26,    
      };
      this.textCondition = this.valueCondition.viewText+" - ";
    }
    if (this.matchingElement.condition === "INSPECCIONADO-REPARADO") {
      this.valueCondition = {
        viewText: "Inspeccionado - Reparado", // "Inspeccionado - Reparado"
        attrId: 27,    
      };
      this.textCondition = this.valueCondition.viewText+" - ";
    }
    if (this.matchingElement.condition === null) {
      this.textCondition = " ";
    }
    this.attributesText = " ";
  }

  onAttributesTextChange(newText: string): void {
    const matchingElement = this.errorList.find(
      (item) => item.index === this.selectedElementValue.index
    );
    if (matchingElement && matchingElement.elementName) {
      this.attributesText = `${matchingElement.elementName.toUpperCase()} ${newText}`;
    } else {
      this.attributesText = `Elemento desconocido ${newText}`;
    }
    this.cdr.detectChanges();
  }
  onTextElementChange(newTextError: string): void {
    const matchingElement = this.errorList.find(
      (item) => item.index === this.selectedElementValue.index
    );
    if (matchingElement && matchingElement.elementName) {
      this.addTextElement = `${matchingElement.elementName.toUpperCase()} ${newTextError}`;
    } else {
      this.addTextElement = `Elemento desconocido ${newTextError}`;
    }
    this.newErrorElement = matchingElement.elementName;
    this.cdr.detectChanges();
  }

  fillAttributesBasedOnSelectedElement(): void {
    if (this.selectedElement) {
      this.initialAttributes = this.selectedElement.initialAttributes || [];
      this.remainingAttributes = this.selectedElement.remainingAttributes || [];
    }
  }

  goBackToAddInformation() {
    this.goBackEvent.emit(true);
  }

  onFieldsComplete(onFieldsComplete: boolean): void{
    this.areFieldsComplete = onFieldsComplete;
    this.cdr.detectChanges();
  }

  addSelectedElement() {
    const wordsArray = this.newErrorElement.split(/[\s,]+/).map(word => word.trim());
    this.elementsArray
    if (this.areFieldsComplete) {
      this.fixedItems.push({ viewText: this.attributesText });
      this.cdr.detectChanges();
      if (this.selectedElementValue) {
        const lastInitialAttributes = [...this.initialAttributes];
        const lastRemainingAttributes = [...this.remainingAttributes];
        if (this.errorList.length > 1) {
          this.errorList = this.errorList.map((item: any) => {
            if (item.index === this.selectedElementValue.index) {
              return {
                ...item,
                attributeParts: this.attributePartsError,
                description: this.addTextElement,
                descriptionWithOutNameElement: wordsArray,
              };
            }
            return item; 
          });
        } else if (this.errorList.length === 1) {
          this.errorItems = this.errorItems.filter(
            (item) => item !== this.selectedElementValue
          );
          this.errorList = this.errorList.filter(
            (item: any) => !(item.index === this.selectedElementValue.index)
          );
          this.fixedElements = this.fixedElements.filter(
            (item: any) => !(item.index === this.selectedElementValue.index)
          );
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Success,
            summary: 'Saliendo...',
            detail: 'Elementos agregados correctamente',
            life: 6000,
          }
          this.messageService.add(alert);
          setTimeout(() => {
            window.location.reload();
          }, 6000);
        }
        this.errorList = [...this.errorList];
        this.selectedElement = null;
        this.selectedElementValue = "";
        this.attributesText = '';
        this.textCondition = " ";
        this.areFieldsComplete = false; 
        this.initialAttributes = lastInitialAttributes;
        this.remainingAttributes = lastRemainingAttributes;
        this.cdr.detectChanges();
      }
    }  
  }

  addElementNoAttribute() {
    this.attributesText = this.selectedElementValue.viewText;
    if (!this.areFieldsComplete) {
      this.fixedItems.push({ viewText: this.attributesText });
      this.cdr.detectChanges();
      if (this.selectedElementValue) {
        const lastInitialAttributes = [...this.initialAttributes];
        const lastRemainingAttributes = [...this.remainingAttributes];
        this.errorItems = this.errorItems.filter(
          (item) => item !== this.selectedElementValue
        );
        this.errorList = this.errorList.filter(
          (item: any) => !(item.index === this.selectedElementValue.index)
        );
        this.fixedElements = this.fixedElements.filter(
          (item: any) => !(item.index === this.selectedElementValue.index)
        );
        this.errorList = [...this.errorList];
        this.checkAndHandleErrorList();        
        this.selectedElement = null;
        this.selectedElementValue = "";
        this.attributesText = '';
        this.textCondition = " ";
        this.areFieldsComplete = false; 
        this.initialAttributes = lastInitialAttributes;
        this.remainingAttributes = lastRemainingAttributes;
        this.cdr.detectChanges();
      }
    }
  }
  
  checkAndHandleErrorList() {
    if (this.errorList.length === 0) {
      const alert: SlbMessage = {
        target: 'toast',
        severity: SlbSeverity.Success,
        summary: 'Saliendo...',
        detail: 'Elementos agregados correctamente',
        life: 6000,
      };
      this.messageService.add(alert);
      setTimeout(() => {
        window.location.reload();
      }, 6000);
    } else {
      this.errorListChange.emit(this.errorList);
      this.control.reset();
      this.errorDataRevision.emit(this.errorList);
      this.updateErrorList();
      this.cdr.detectChanges();
    }
  }
  
  updateErrorList(): void {
    this.errorList = [...this.errorList];
    this.errorListChange.emit(this.errorList);
  }

  addDataBase() {
    this.newErrorElement = this.selectedElementValue.viewText;
    this.nameElementParts = this.newErrorElement.split(" ");
    const obj = {
      name: this.inputElementName,
      idStandardBusinessLines: this.idBusinessLineArray,
      idStandardWellSections: 1,
      verified: 0,
      idStandardWellInfrastructureType: null,
    };
    console.log("obj", obj);
    this.logisticService.postNewStandardElementError(obj).subscribe(
      (res: any) => {
        const confirmation: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Info',
          detail: res['message'],
        };
        this.control.reset();
        this.selectedElement = null;
        this.selectedElementValue = "";
        this.attributesText = '';
        this.areFieldsComplete = false; 
        this.inputElementName = '';
        this.cdr.detectChanges();
        this.messageService.add(confirmation);
        this.updateDataEvent.emit();
      },
      (error) => {
        console.error('Error al guardar:', error);
        const alert: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error al guardar',
          detail: error['Errormessage'],
        };
        this.messageService.add(alert);
      }
    );
  }


  returnToProcessData(): void {
    this.goBackToAddInformation();
  }
}

