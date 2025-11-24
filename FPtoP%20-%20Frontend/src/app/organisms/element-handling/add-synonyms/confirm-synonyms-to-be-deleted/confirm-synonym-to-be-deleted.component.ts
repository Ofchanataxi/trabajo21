import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';
import { Synonym } from '../../interfaces/interfaces.interfaces';

@Component({
  selector: 'app-confirm-synonym-to-be-deleted',
  templateUrl: './confirm-synonym-to-be-deleted.component.html',
})
export class ConfirmSynonymToBeDeletedComponent {
  @Input() synonym!: Synonym;
  @Input() idUser!: number | null;
  @Output() synonymDeleted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>(); // Para cerrar sin eliminar
  isChecked: boolean = false;

  constructor(
    private catalogManagementService: CatalogManagementService,
    private messageService: MessageService
  ) {}

  deleteSynonym() {
    if (!this.isChecked || !this.synonym) return;

    // NECESITARÁS ESTE MÉTODO EN TU SERVICIO
    this.catalogManagementService.deleteStandardElementSynonym(this.synonym.id, this.idUser).subscribe({
      next: res => {
        this.messageService.add({
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Sinónimo eliminado',
          detail: 'El sinónimo ha sido eliminado correctamente.',
        });
        this.synonymDeleted.emit();
      },
      error: err => {
        console.error('Error al eliminar el sinónimo:', err);
        this.messageService.add({
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error',
          detail: 'No se pudo eliminar el sinónimo.',
        });
      },
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
