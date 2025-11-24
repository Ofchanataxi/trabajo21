import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';

@Component({
  selector: 'add-element-component',
  templateUrl: './add-element.component.html',
})
export class AddElementComponent implements OnInit {
  @Output() elementAdded = new EventEmitter<void>();
  @Input() initialElementName: string | null = null;
  @Input() editElement: boolean = false;
  @Input() idStandardElement: number | null = null;

  form: FormGroup;
  formChanged: boolean = false;

  idStandardBusinessLine: number | null = null;
  idStandardWellSection: number | null = null;
  idStandardWellInfrastructureType: number | null = null;

  constructor(
    private catalogService: CatalogManagementService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.initialElementName || '', Validators.required],
      verified: [true],
      showRunBES: [true],
      needSerialNumber: [true],
    });
    this.form.valueChanges.subscribe(() => {
      this.formChanged = true;
    });

    if (this.editElement && this.idStandardElement !== null) {
      this.getStandardElementByid();
    }
  }

  getIdBusinessLine(id: number | null) {
    this.idStandardBusinessLine = id;
    this.formChanged = true; 
  }

  getIdStanardWellSection(id: number | null) {
    this.idStandardWellSection = id;
    this.formChanged = true; 
  }

  getIdStandardWellInfrastructureType(id: number | null) {
    this.idStandardWellInfrastructureType = id;
    this.formChanged = true; 
  }

  getStandardElementByid() {
    if (this.idStandardElement === null) {
      return;
    }

    const elementIdObject = { id: this.idStandardElement };

    this.catalogService.getStandardElementsById(elementIdObject).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          const elementData = response.data[0]; 

          this.form.patchValue(
            {
              name: elementData.name,
              verified: elementData.verified,
              showRunBES: elementData.showRunBES,
              needSerialNumber: elementData.needSerialNumber,
            },
            { emitEvent: false }
          ); 

          this.idStandardBusinessLine = elementData.idStandardBusinessLines || null;
          this.idStandardWellSection = elementData.idStandardWellSections || null;
          this.idStandardWellInfrastructureType =
            elementData.idStandardWellInfrastructureType || null;

          this.form.markAsPristine();
          this.form.markAsUntouched();
          this.formChanged = false; 
          
          const successMsg: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Success,
            summary: 'Éxito',
            detail: `Elemento "${elementData.name}" cargado para edición.`,
          };
          this.messageService.add(successMsg);
        } 
      },
      error: (err) => {
        console.error('Error al obtener el elemento por ID:', err);
        const alert: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error',
          detail: err.error?.message || 'No se pudo obtener el elemento para edición.',
        };
        this.messageService.add(alert);
        this.formChanged = false; 
      },
    });
  }

  onSubmit() {
    if (this.editElement) {
      this.updateElement();
    } else {
      this.addElement();
    }
  }

  addElement() {
    if (
      this.form.invalid ||
      !this.idStandardBusinessLine ||
      !this.idStandardWellSection ||
      !this.idStandardWellInfrastructureType
    ) {
      this.messageService.add({
        target: 'toast',
        severity: SlbSeverity.Warning,
        summary: 'Formulario inválido',
        detail: 'Por favor, complete todos los campos requeridos y seleccione las categorías.',
      });
      return;
    }

    const newElement = {
      name: this.form.value.name,
      idStandardBusinessLines: this.idStandardBusinessLine,
      idStandardWellSections: this.idStandardWellSection,
      verified: this.form.value.verified,
      idStandardWellInfrastructureType: this.idStandardWellInfrastructureType,
      showRunBES: this.form.value.showRunBES,
      needSerialNumber: this.form.value.needSerialNumber,
    };

    this.catalogService.addStandardElement(newElement).subscribe({
      next: res => {
        const confirmation: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Elemento añadido',
          detail: res['message'] || 'Elemento agregado correctamente.',
        };
        this.messageService.add(confirmation);

        this.elementAdded.emit();
        this.form.reset();
        this.idStandardBusinessLine = null;
        this.idStandardWellSection = null;
        this.idStandardWellInfrastructureType = null;
        this.formChanged = false; // Resetear el estado de cambio después de añadir
      },
      error: err => {
        console.error('Error al añadir el elemento:', err);
        const alert: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error',
          detail: err.error?.message || 'No se pudo añadir el elemento.',
        };
        this.messageService.add(alert);
      },
    });
  }

  updateElement() {
    if (
      this.form.invalid ||
      this.idStandardBusinessLine === null ||
      this.idStandardWellSection === null ||
      this.idStandardWellInfrastructureType === null ||
      this.idStandardElement === null 
    ) {
      this.messageService.add({
        target: 'toast',
        severity: SlbSeverity.Warning,
        summary: 'Formulario inválido',
        detail: 'Por favor, complete todos los campos requeridos y seleccione las categorías para actualizar.',
      });
      return;
    }

    const updatedElement = {
      id: this.idStandardElement,
      name: this.form.value.name,
      idStandardBusinessLines: this.idStandardBusinessLine,
      idStandardWellSections: this.idStandardWellSection,
      verified: this.form.value.verified,
      idStandardWellInfrastructureType: this.idStandardWellInfrastructureType,
      showRunBES: this.form.value.showRunBES,
      needSerialNumber: this.form.value.needSerialNumber,
    };
    
    this.catalogService.updateStandardElement(updatedElement).subscribe({
      next: res => {
        const confirmation: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Elemento actualizado',
          detail: res['message'] || 'Elemento actualizado correctamente.',
        };
        this.messageService.add(confirmation);
        this.elementAdded.emit(); // Emite para refrescar la lista si es necesario
        this.form.markAsPristine(); // Marcar el formulario como prístino después de guardar
        this.form.markAsUntouched();
        this.formChanged = false; // Resetear el estado de cambio
      },
      error: err => {
        console.error('Error al actualizar el elemento:', err);
        const alert: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error',
          detail: err.error?.message || 'No se pudo actualizar el elemento.',
        };
        this.messageService.add(alert);
      },
    });
  }
}
