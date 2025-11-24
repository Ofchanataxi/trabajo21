import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core'; // <-- AÑADIR OnChanges y SimpleChanges
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';
import { Synonym } from '../interfaces/interfaces.interfaces';

@Component({
  selector: 'app-add-synonyms-component',
  templateUrl: './add-synonyms.component.html',
})
export class AddSynonymsComponent implements OnInit, OnChanges { // <-- IMPLEMENTAR OnChanges
  attributeForm!: FormGroup;
  @Input() idStandardElements!: number | null;
  @Input() standardElementName!: string | null;
  @Input() synonymToEdit: Synonym | null = null;
  @Output() synonymModified = new EventEmitter<void>(); // <-- Usaremos solo este evento

  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogManagementService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.attributeForm = this.fb.group({ synonym: ['', Validators.required] });
  }
  
  // FIX: Detectar cambios para entrar en modo edición
  ngOnChanges(changes: SimpleChanges) {
    if (changes['synonymToEdit'] && this.synonymToEdit) {
      this.isEditMode = true;
      this.attributeForm.patchValue({ synonym: this.synonymToEdit.synonym });
    } else {
        // Asegurarse de que al abrir para "agregar", el modo edición esté desactivado
        this.isEditMode = false;
        this.attributeForm.reset();
    }
  }

  // FIX: Lógica del onSubmit completamente reestructurada
  onSubmit() {
    if (this.attributeForm.invalid) {
      return;
    }

    if (this.isEditMode && this.synonymToEdit) {
      this.updateSynonym();
    } else {
      this.addNewSynonym();
    }
  }

  private addNewSynonym() {
    if (!this.idStandardElements) return;

    const newSynonymPayload = {
      synonym: this.attributeForm.value.synonym,
      idStandardElements: this.idStandardElements,
    };
    this.catalogService.addStandarElementsSynonyms(newSynonymPayload).subscribe({
      next: res => {
        this.messageService.add({
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Sinónimo añadido',
          detail: 'El sinónimo ha sido agregado correctamente.',
        });
        this.synonymModified.emit(); // Emitir el evento unificado
      },
      error: err => {
        this.messageService.add({
          target: 'toast',
          severity: SlbSeverity.Error,
          summary: 'Error',
          detail: err.error?.message || 'No se pudo añadir el sinónimo.',
        });
      },
    });
  }

  private updateSynonym() {
    if (!this.synonymToEdit) return;

    const synonymText = this.attributeForm.value.synonym;
    
    // Llamar al método del servicio corregido
    this.catalogService.editStandarElementsSynonyms(this.synonymToEdit.id, synonymText).subscribe({
      next: res => {
        this.messageService.add({
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Sinónimo actualizado',
          detail: 'El sinónimo ha sido actualizado correctamente.',
        });
        this.synonymModified.emit(); // Emitir el evento unificado
      },
      error: err => {
        this.messageService.add({
          target: 'toast',
          severity: SlbSeverity.Error,
          summary: 'Error',
          detail: err.error?.message || 'No se pudo actualizar el sinónimo.',
        });
      },
    });
  }
}