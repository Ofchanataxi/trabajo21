import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { LogisticService } from 'src/app/features/logistic/services/logistic.service';
import { StandardAttributeOption } from '../interfaces/interfaces.interfaces';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'app-attribute-options',
  templateUrl: './attribute-options.component.html',
})
export class AttributeOptionsComponent implements OnInit {
  optionForm!: FormGroup;

  @Input() idStandardAttribute!: number | null;
  @Input() optionToEdit: StandardAttributeOption  | null = null;
  @Output() opcionAgregada = new EventEmitter<void>();
  @Output() cerrarFormulario = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private catalogManagementService: CatalogManagementService,
    private logisticService: LogisticService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.optionForm = this.fb.group({
      newElementName: ['', Validators.required],
      verified: [true],
    });
    if (this.optionToEdit) {
      this.optionForm.patchValue({
        newElementName: this.optionToEdit.option_value,
        verified: this.optionToEdit.option_verified,
      });
    }
  }

  submit() {
    if (this.optionForm.invalid || !this.idStandardAttribute) return;
 
    if (this.optionToEdit) {
      const editedOption: StandardAttributeOption = {
        option_id: this.optionToEdit.option_id,
        option_value: this.optionForm.value.newElementName,
        option_verified: this.optionForm.value.verified,
      };
 
      this.catalogManagementService.updateAttributeOption(this.idStandardAttribute, editedOption).subscribe({
        next: res => {
          const confirmation: SlbMessage = {
            target: 'toast',
            severity: res.status === 'warning' ? SlbSeverity.Warning : SlbSeverity.Success,
            summary: res.status === 'warning' ? 'La opción ya existe' : 'Opción actualizada',
            detail: res['message'] || 'Opción actualizada correctamente.',
          };
          this.messageService.add(confirmation);
          this.opcionAgregada.emit();
          this.optionForm.reset();
          this.cerrarFormulario.emit();
        },
        error:  err => {
          console.error('Error al añadir la opción:', err);
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Warning,
            summary: 'Error',
            detail: err['Errormessage'] || 'No se pudo actualizar la opción.',
          };
          this.messageService.add(alert);
        },
      });
    } else {
      const newOption = {
        ...this.optionForm.value,
        idStandardAttribute: this.idStandardAttribute,
      };
      this.logisticService.postNewAttributeElement(newOption).subscribe({
        next: res => {
          const confirmation: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Success,
            summary: 'Opción añadida',
            detail: res['message'] || 'Opción agregada correctamente.',
          };
          this.messageService.add(confirmation);
          this.opcionAgregada.emit();
          this.optionForm.reset();
          this.cerrarFormulario.emit();
        },
        error:  err => {
          console.error('Error al añadir la opción:', err);
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Warning,
            summary: 'Error',
            detail: err['Errormessage'] || 'No se pudo añadir la opción.',
          };
          this.messageService.add(alert);
        },
      });
    }
  }
}
