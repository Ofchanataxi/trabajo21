import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { LogisticService } from 'src/app/features/logistic/services/logistic.service';
import { StandardAttributes } from '../interfaces/interfaces.interfaces';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

type EditableStandardAttribute = Partial<Pick<
  StandardAttributes,
  'id' | 'name' | 'idStandardAttributeTypes' | 'required' | 'alwaysShow' | 'verified' | 'useInGroupBy' | 'measurementUnit' | 'showRunBES'
>>;

@Component({
  selector: 'app-add-attribute-component',
  templateUrl: './add-attribute.component.html',
})
export class AddAttributeComponent implements OnInit {
  attributeForm!: FormGroup;
  @Input() idStandardElement!: number | null;
  @Input() orderInDescription!: number | null;
  @Input() attributeToEdit: EditableStandardAttribute | null = null;
  @Output() atributoAgregado = new EventEmitter<void>();
  idStandardAttributeTypes: number | null = null;

  constructor(
    private fb: FormBuilder,
    private catalogManagementService: CatalogManagementService,
    private logisticService: LogisticService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.attributeForm = this.fb.group({
      newAttributeName: ['', Validators.required],
      newMeasurementUnit: [''],
      required: [true],
      alwaysShow: [true],
      verified: [true],
      useInGroupBy: [true],
      showRunBES: [false],
    });
    if (this.attributeToEdit) {
      this.attributeForm.patchValue({
        newAttributeName: this.attributeToEdit.name,
        newMeasurementUnit: this.attributeToEdit.measurementUnit,
        required: this.attributeToEdit.required,
        alwaysShow: this.attributeToEdit.alwaysShow,
        verified: this.attributeToEdit.verified,
        useInGroupBy: this.attributeToEdit.useInGroupBy,
        showRunBES: this.attributeToEdit.showRunBES,
      });
      this.idStandardAttributeTypes = this.attributeToEdit.idStandardAttributeTypes ?? null;
    }
  }

  getIdStandardAttributeTypes(id: number | null) {
    this.idStandardAttributeTypes = id;
  }

  onSubmit() {
    if (this.attributeForm.invalid || !this.idStandardAttributeTypes || !this.idStandardElement)
      return;

    if (this.attributeToEdit) {
      const editedAttribute = {
        id: this.attributeToEdit.id,
        name: this.attributeForm.value.newAttributeName,
        idStandardAttributeTypes: this.idStandardAttributeTypes,
        required: this.attributeForm.value.required,
        alwaysShow: this.attributeForm.value.alwaysShow,
        verified: this.attributeForm.value.verified,
        useInGroupBy: this.attributeForm.value.useInGroupBy,
        measurementUnit: this.attributeForm.value.newMeasurementUnit,
        showRunBES: this.attributeForm.value.showRunBES,
      };
  
      this.catalogManagementService.updateAttribute(this.idStandardElement, editedAttribute).subscribe({
        next: res => {
          const confirmation: SlbMessage = {
            target: 'toast',
            severity: res.status === 'warning' ? SlbSeverity.Warning : SlbSeverity.Success,
            summary: res.status === 'warning' ? 'El atributo ya existe' : 'Atributo actualizado',
            detail: res['message'] || 'Atributo actualizado correctamente.',
          };
          this.messageService.add(confirmation);
          this.atributoAgregado.emit();
          this.attributeForm.reset();
        },
        error:  err => {
          console.error('Error al actualizar el atributo:', err);
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Warning,
            summary: 'Error',
            detail: err['Errormessage'] || 'No se pudo actualizar el atributo.',
          };
          this.messageService.add(alert);
        },
      });
    } else {
      const newAttribute = {
        ...this.attributeForm.value,
        idStandardAttributeTypes: this.idStandardAttributeTypes,
        idStandardElement: this.idStandardElement,
        orderInDescription: this.orderInDescription ? this.orderInDescription + 1 : 1,
        onlyShowWith_idStandardAttributes: null,
        onlyShowWith_idStandardAttributeOptions: null,
        idDefaultStandardAttributeOptions: null,
      };
      console.log(newAttribute);

      this.logisticService.postNewAttributeList(newAttribute).subscribe({
        next: res => {
          const confirmation: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Success,
            summary: 'Atributo añadido',
            detail: res['message'] || 'Atributo agregado correctamente.',
          };
          this.messageService.add(confirmation);

          this.atributoAgregado.emit();
          this.attributeForm.reset();
        },
        error: err => {
          console.error('Error al añadir el atributo:', err);
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Warning,
            summary: 'Error',
            detail: err['Errormessage'] || 'No se pudo añadir el atributo.',
          };
          this.messageService.add(alert);
        },
      });
    }
  }
}
