import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'app-confirm-options-to-be-deleted',
  templateUrl: './confirm-options-to-be-deleted.component.html',
  styleUrls: ['./confirm-options-to-be-deleted.component.scss']
})
export class ConfirmOptionsToBeDeletedComponent implements OnInit {
  @Input() idStandardAttributeOption: number;
  @Input() attributeName: string;
  @Input() option: string;
  @Input() idUser: number | null;
  @Output() updateOptions = new EventEmitter<void>();
  isChecked: boolean = false;
  constructor(
    private catalogManagementService: CatalogManagementService,
    private messageService: MessageService){}
  ngOnInit(): void {
    
  }
  deleteOption() {
    if (!this.isChecked) return;
    this.catalogManagementService.deleteAttributeOption(this.idStandardAttributeOption, this.idUser).subscribe({
      next: (res) => {
        const confirmation: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Success,
          summary: 'Opción eliminada',
          detail: 'Opción eliminada correctamente.',
        };
        this.messageService.add(confirmation);
        this.updateOptions.emit();
      },
      error: (err) => {
        console.error('Error al eliminar la opción:', err);
        const alert: SlbMessage = {
          target: 'toast',
          severity: SlbSeverity.Warning,
          summary: 'Error',
          detail: err['Errormessage'] || 'No se pudo eliminar la opción.',
        };
        this.messageService.add(alert);
      }
    });
  }

}
