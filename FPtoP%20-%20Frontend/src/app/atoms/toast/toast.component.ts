import { Component, TemplateRef } from '@angular/core';
import { MessageService, SlbModalConfig, SlbSeverity } from '@slb-dls/angular-material/notification';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})

export class ToastComponent {
  constructor(private messageService: MessageService) {}

  showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: SlbSeverity.Success,
      summary: 'Success',
      detail: detail,
    });
  }
}
