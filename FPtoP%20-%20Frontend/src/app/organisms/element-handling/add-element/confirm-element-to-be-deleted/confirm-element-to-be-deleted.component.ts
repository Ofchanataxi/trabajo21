import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'app-confirm-element-to-be-deleted',
  templateUrl: './confirm-element-to-be-deleted.component.html',
  styleUrls: ['./confirm-element-to-be-deleted.component.scss'],
})
export class ConfirmElementToBeDeletedComponent {
  @Input() idStandardElement!: number;
  @Input() nameStandardElement!: string;  
  @Input() idUser!: number | null;
  @Output() updateElement = new EventEmitter<void>();
  isChecked: boolean = false;

  constructor(
    private catalogManagementService: CatalogManagementService,
    private messageService: MessageService
  ){}

  deleteElement() {
    if (!this.isChecked) return;
    this.catalogManagementService.deleteElement(this.idStandardElement, this.idUser).subscribe({
      next: (res) => {
        const confirmation: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Elemento eliminado',
          detail: 'Elemento eliminado correctamente.',
        };
        this.messageService.add(confirmation);
        this.updateElement.emit();
      },
      error: (err) => {
        console.error('Error al eliminar el elemento:', err);
        const alert: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error',
          detail: err['Errormessage'] || 'No se pudo eliminar el elemento.',
        };
        this.messageService.add(alert);
      }   
    });
  }
}
