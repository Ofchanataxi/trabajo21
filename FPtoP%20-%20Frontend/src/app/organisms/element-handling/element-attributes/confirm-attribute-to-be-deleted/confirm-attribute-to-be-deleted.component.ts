import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'app-confirm-attribute-to-be-deleted',
  templateUrl: './confirm-attribute-to-be-deleted.component.html',
  styleUrls: ['./confirm-attribute-to-be-deleted.component.scss'],
})
export class ConfirmAttributeToBeDeletedComponent {
  @Input() idStandardElement: number | null;
  @Input() idStandardAttribute: number;
  @Input() StandardAttributeName: string;
  @Input() attributeOrderInDescription: number;
  @Input() idUser: number | null;
  @Output() updateAttributes = new EventEmitter<void>();

  isChecked: boolean = false;

  constructor(
    private catalogManagementService: CatalogManagementService,
    private messageService: MessageService
  ) {}

  deleteAttribute() {
    if (!this.isChecked) return;
    this.catalogManagementService
      .deleteAttribute(
        this.idStandardElement,
        this.idStandardAttribute,
        this.attributeOrderInDescription,
        this.idUser 
      )
      .subscribe({
        next: res => {
          const confirmation: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Success,
            summary: 'Atributo eliminado',
            detail: 'Atributo eliminado correctamente.',
          };
          this.messageService.add(confirmation);
          this.updateAttributes.emit();
        },
        error: err => {
          console.error('Error al eliminar el atributo:', err);
          const alert: SlbMessage = {
            target: 'toast',
            severity: SlbSeverity.Warning,
            summary: 'Error',
            detail: err.error.message || 'No se pudo eliminar el atributo.',
          };
          this.messageService.add(alert);
        },
      });
  }
}
